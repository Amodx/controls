import { ControlEventTypes } from "./Event.types.js";
import { ControlEventConstructor } from "./ControlEventBase.js";
import {
  WheelDownEvent,
  WheelUpEvent,
  GamepadDownEvent,
  GamepadUpEvent,
  KeyUpEvent,
  KeyDownEvent,
  PointerDownEvent,
  PointerUpEvent,
  GamepadAxesMoveEvent,
  PointerHoldEvent,
  GamepadButtonHoldEvent,
  KeyHoldEvent,
} from "./Register/index.js";

export class ControlEventManager {
  private static _events = new Map<string, ControlEventConstructor<any, any>>();

  static registerEvents(event: ControlEventConstructor<any, any>[]) {
    event.forEach((event) => this._events.set(event.eventType, event));
  }
  static getEvent(id: ControlEventTypes) {
    return this._events.get(id)!;
  }
}

export type ControlEvents =
  | WheelDownEvent
  | WheelUpEvent
  | GamepadDownEvent
  | GamepadUpEvent
  | KeyUpEvent
  | KeyDownEvent
  | PointerDownEvent
  | PointerUpEvent
  | GamepadAxesMoveEvent
  | PointerHoldEvent
  | GamepadButtonHoldEvent
  | KeyHoldEvent;

ControlEventManager.registerEvents([
  //mouse
  PointerDownEvent,
  PointerUpEvent,
  PointerHoldEvent,
  //gamepad button
  GamepadDownEvent,
  GamepadUpEvent,
  GamepadButtonHoldEvent,
  //game axes
  GamepadAxesMoveEvent,
  //keyabord
  KeyUpEvent,
  KeyDownEvent,
  KeyHoldEvent,
  //wheel
  WheelDownEvent,
  WheelUpEvent,
]);
