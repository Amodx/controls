import { ControlInputTypes } from "../../Controls/ControlData";
import { ControlEventTypes } from "../Event.types";
import { ControlEvent } from "../ControlEventBase";
import { Control } from "../../Controls/Control";
import { ControlsInternal } from "../../Internal/ControlsInternal";

abstract class BasePointerEvent<
  Events extends Record<string, any>,
> extends ControlEvent<Events, PointerEvent> {
  readonly inputType = ControlInputTypes.Pointer;
  getButton() {
    return this.origin.button;
  }
}

export class PointerDownEvent extends BasePointerEvent<{
  release: {};
}> {
  static eventType = ControlEventTypes.PointerDown;
  readonly eventType = ControlEventTypes.PointerDown;
  constructor(control: Control, event: PointerEvent) {
    super(control, event);
    ControlsInternal.addMouseButtonForRelease(`${event.button}`, this);
  }
}

export class PointerHoldEvent extends BasePointerEvent<{}> {
  static eventType = ControlEventTypes.PointerHold;
  readonly eventType = ControlEventTypes.PointerHold;
}

export class PointerUpEvent extends BasePointerEvent<{}> {
  static eventType = ControlEventTypes.PointerUp;
  readonly eventType = ControlEventTypes.PointerUp;
}

abstract class BaseWheelEvent extends ControlEvent {
  readonly inputType = ControlInputTypes.Scroll;
  getDirection() {
    return this.control.data.input[ControlInputTypes.Scroll]?.mode;
  }
}

export class WheelUpEvent extends BaseWheelEvent {
  static eventType = ControlEventTypes.WheelUp;
  readonly eventType = ControlEventTypes.WheelUp;
}

export class WheelDownEvent extends BaseWheelEvent {
  static eventType = ControlEventTypes.WheelDown;
  readonly eventType = ControlEventTypes.WheelDown;
}
