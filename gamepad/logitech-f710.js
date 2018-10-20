class LogitechF710 {
    constructor() {
        this._xAxisLeft = 0;
        this._yAxisLeft = 0;
        this._xAxisRight = 0;
        this._yAxisRight = 0;
        this._triggerLeft = 0;
        this._triggerRight = 0;

        this._pov = -1;

        this._shoulderLeft = false;
        this._shoulderRight = false;

        this._leftStickButton = false;
        this._rightStickButton = false;

        this._aButton = false;
        this._bButton = false;
        this._xButton = false;
        this._yButton = false;

        this._backButton = false;
        this._startButton = false;
    }

    handleGamepadEvent(evt) {

    }

    getLeftXAxis() {
        return this._xAxisLeft;
    }

    getLeftYAxis() {
        return this._yAxisLeft;
    }

    getRightXAxis() {
        return this._xAxisRight;
    }

    getRightYAxis() {
        return this._yAxisRight;
    }

    getLeftTrigger() {
        return this._triggerLeft;
    }

    getRightTrigger() {
        return this._triggerRight;
    }

    getPOV() {
        return this._pov;
    }

    getLeftStickButton() {
        return this._leftStickButton;
    }

    getRightStickButton() {
        return this._rightStickButton;
    }

    getLeftShoulderButton() {
        return this._shoulderLeft;
    }

    getRightShoulderButton() {
        return this._shoulderRight;
    }

    getBackButton() {
        return this._backButton;
    }

    getStartButton() {
        return this._startButton;
    }

    getAButton() {
        return this._aButton;
    }

    getBButton() {
        return this._bButton;
    }

    getXButton() {
        return this._xButton;
    }

    getYButton() {
        return this._yButton;
    }
};

class F710Linux extends LogitechF710 {
    handleGamepadEvent(evt) {
        this._xAxisLeft = evt.axisStates[0];
        this._yAxisLeft = evt.axisStates[1];
        this._xAxisRight = evt.axisStates[3];
        this._yAxisRight = evt.axisStates[4];
        this._triggerLeft = evt.axisStates[2];
        this._triggerRight = evt.axisStates[5];

        this._aButton = evt.buttonStates[0];
        this._bButton = evt.buttonStates[1];
        this._xButton = evt.buttonStates[2];
        this._yButton = evt.buttonStates[3];

        this._shoulderLeft = evt.buttonStates[4];
        this._shoulderRight = evt.buttonStates[5];

        this._backButton = evt.buttonStates[6];
        this._startButton = evt.buttonStates[7];

        this._leftStickButton = evt.buttonStates[9];
        this._rightStickButton = evt.buttonStates[10];

        // Handle POV
        // axis 6 = x, 7 = y. -1 = left, 1 = right | -1 = top, 1 = bottom
        var povX = evt.axisStates[6];
        var povY = evt.axisStates[7];

        if (povX === 0 && povY === 0) {
            this._pov = -1;
        }
        else if (povX === 0) {
            if (povY === -1) {
                this._pov = 0;
            }
            else if (povY === 1) {
                this._pov = 180;
            }
        }
        else if (povY === 0) {
            if (povX === -1) {
                this._pov = 270;
            }
            else if (povX === 1) {
                this._pov = 90;
            }
        }
        else if (povX === 1 && povY === -1) {
            this._pov = 45;
        }
        else if (povX === 1 && povY === 1) {
            this._pov = 135;
        }
        else if (povX === -1 && povY === -1) {
            this._pov = 315;
        }
        else if (povX === -1 && povY === 1) {
            this._pov = 215;
        }
    }
}

class F710Windows extends LogitechF710 {

}

module.exports = {
    F710Linux: F710Linux,
    F710Windows: F710Windows
};