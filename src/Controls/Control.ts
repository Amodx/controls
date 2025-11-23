import { ControlEvent } from "../Events/ControlEventBase";
import { User } from "../Users/User";
import { ControlAction } from "./ControlAction";
import { ControlInputTypes } from "./ControlData";

export class Control {
  constructor(public user: User, public data: ControlAction) {}

  run(event: ControlEvent<any>) {
    this.data.action(event);
  }

  getInputString(type: ControlInputTypes) {
    const none = "NONE";
    switch (type) {
      case ControlInputTypes.KeyBoard:
        return this.data.input[type]?.key || none;
      case ControlInputTypes.Pointer:
        return this.data.input[type]?.button || none;
      case ControlInputTypes.Scroll:
        return this.data.input[type]?.mode || none;
      case ControlInputTypes.GamePadButton:
        return this.data.input[type]?.button || none;
      case ControlInputTypes.GamePadAxes:
        return this.data.input[type]?.stick || none;
    }
  }
}
