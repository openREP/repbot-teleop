const gamepad = require("gamepad");
const OS = require("os");
const LogitechF710 = require("./gamepad/logitech-f710");

const RepBot = require("@openrep/repbot");

const ROMI_I2C_ADDRESS = 0x14;

const ROMI_ROBOT = {
    devices: {
        "romi": {
            type: "romi",
            deviceConfig: {
                address: ROMI_I2C_ADDRESS
            },
            portMappings: {
                digital: [
                    {
                        channel: 0,
                        deviceChannel: 0,
                        direction: "out"
                    },
                    {
                        channel: 1,
                        deviceChannel: 1,
                        direction: "out"
                    },
                    {
                        channel: 2,
                        deviceChannel: 3,
                        direction: "in"
                    },
                    {
                        channel: 3,
                        deviceChannel: 4,
                        direction: "in"
                    }
                ],
                analog: [
                    {
                        channel: 0,
                        deviceChannel: 0
                    },
                    {
                        channel: 1,
                        deviceChannel: 1
                    }
                ],
                pwm: [
                    {
                        channel: 0,
                        deviceChannel: 0,
                        type: "motor"
                    },
                    {
                        channel: 1,
                        deviceChannel: 1,
                        type: "motor"
                    }
                ],
                encoder: [
                    {
                        channel: 0,
                        deviceChannel: 0
                    },
                    {
                        channel: 1,
                        deviceChannel: 1
                    }
                ],
                gyro: [
                    {
                        channel: 0,
                        deviceChannel: 0
                    }
                ],
                accelerometer: [
                    {
                        channel: 0,
                        deviceChannel: 0
                    }
                ]
            }
        }
    }
};

// === START OF ACTUAL SCRIPT ===
gamepad.init();

let gamepadId = -1;

for (let i = 0, l = gamepad.numDevices(); i < l; i++) {
    const gamepadInfo = gamepad.deviceAtIndex(i);
    if (gamepadInfo.description === "Logitech Gamepad F710") {
        gamepadId = i;
        break;
    }
}

if (gamepadId === -1) {
    console.log("Logitech F710 not found!");
    process.exit(0);
}

let logitechGamepad;

if (OS.platform() === "linux") {
    logitechGamepad = new LogitechF710.F710Linux();
    console.log("Using Linux mappings");
}
else if (OS.platform() === "win32") {
    logitechGamepad = new LogitechF710.F710Windows();
    console.log("Using Windows mappings");
}
else {
    console.log("Non supported OS: " + OS.platform());
    process.exit(0);
}

// Create a game loop and poll for events
setInterval(gamepad.processEvents, 16);
// Scan for new gamepads as a slower rate
setInterval(gamepad.detectDevices, 500);

// TODO We need to push the initial set of data

function handleGamepadUpdate(id) {
    logitechGamepad.handleGamepadEvent(gamepad.deviceAtIndex(id));
}

// Anytime we get an event, just fetch gamepad info
gamepad.on("move", (id) => {
    handleGamepadUpdate(id);
});

gamepad.on("up", (id) => {
    handleGamepadUpdate(id);
});

gamepad.on("down", (id) => {
    handleGamepadUpdate(id);
});

const robot = new RepBot(ROMI_ROBOT);

let shutdownCombinationStartTime = null;

let eventLoop = setInterval(() => {
    // Main event loop
    
    // Handle Driving. Need to convert from joystick inputs
    // into motor commands
    const { leftOutput, rightOutput } = arcadeDrive(-logitechGamepad.getLeftYAxis(), logitechGamepad.getRightXAxis(), true);
    robot.motorWrite(0, leftOutput * 100.0);
    robot.motorWrite(1, rightOutput * 100.0);

    if (robot.digitalRead(2) && robot.digitalRead(3)) {
        if (!shutdownCombinationStartTime) {
            shutdownCombinationStartTime = Date.now();
        }

        if (Date.now() - shutdownCombinationStartTime > 3000) {
            console.log("Requested Shutdown");
            robot.shutdown();
            clearInterval(eventLoop);
            shutdownCombinationStartTime = null;
            // TODO maybe also execute linux shutdown
            process.exit(0);
        }
    }
    else {
        shutdownCombinationStartTime = null;
    }
}, 20);

function limit(input) {
    if (input < -1) return -1;
    if (input > 1) return 1;
    return input;
}
function arcadeDrive(xSpeed, zRotation, squareInputs) {
    xSpeed = limit(xSpeed);
    zRotation = limit(zRotation);

    let xNegative = false;
    let zNegative = false;

    if (squareInputs) {
        xNegative = (xSpeed < 0);
        xSpeed = (xSpeed * xSpeed) * (xNegative ? -1 : 1);

        zNegative = (zRotation < 0);
        zRotation = (zRotation * zRotation) * (zNegative ? -1 : 1);
    }

    const maxInput = Math.max(Math.abs(xSpeed), Math.abs(zRotation)) * (xNegative ? -1 : 1);

    let leftOutput = 0;
    let rightOutput = 0;

    if (xSpeed >= 0) {
        if (zRotation >= 0) {
            leftOutput = maxInput;
            rightOutput = xSpeed - zRotation;
        }
        else {
            leftOutput = xSpeed + zRotation;
            rightOutput = maxInput;
        }
    }
    else {
        if (zRotation >= 0.0) {
            leftOutput = xSpeed + zRotation;
            rightOutput = maxInput;
        }
        else {
            leftOutput = maxInput;
            rightOutput = xSpeed - zRotation;
        }
    }

    return {
        leftOutput: limit(leftOutput),
        rightOutput: limit(rightOutput),
    };
}