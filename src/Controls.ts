import { GamepadManager } from "./Gamepads/GamepadManager.js";
import { ControlData, ControlInputData } from "./Controls/ControlData.js";
import { ControlGroupData, ControlAction } from "./Controls/ControlAction.js";
import { RecursivePartial } from "@amodx/core";
import { User } from "./Users/User.js";
import { Environment } from "@amodx/core/Environment/Environment.js";

import { ControlsInternal } from "./Internal/ControlsInternal.js";
import InitControls from "./Internal/InitControls.js";
import { UserManager } from "./Users/UserManager.js";
import { ControlRegister } from "./Controls/ControlRegister.js";
export class Controls {
  static controls = ControlRegister;
  static _os = Environment.system.os;

  static _capturing = false;
  static _capturingMode: "gamepad" | "keyboard" = "gamepad";
  static _capturedData: RecursivePartial<ControlInputData> | null = null;
  static mainUser: User | null = null;
  static controlRootElement: HTMLElement | Window = window;
  private constructor() {}
  static reInitControls = () => {};
  static clearControls = () => {};

  private static _initalized = false;
  static init(
    controlRootElement: HTMLElement | Window = window,
    pointerMode: "mouse" | "pointer" = "mouse",
  ) {
    this.controlRootElement = controlRootElement;
    if (this._initalized) return this;
    this._initalized = true;
    const { addListeners, removeListeners } = InitControls(this, pointerMode);
    this.clearControls = () => {
      removeListeners();
    };
    this.reInitControls = () => {
      addListeners();
    };
    return this;
  }

  static deinit() {
    this.clearControls();
    this.controls.clear();
    UserManager.clear();
    this.mainUser = null;
    this._initalized = false;
  }

  static registerControls(data: ControlGroupData[]) {
    this.controls.registerData(data);
    return this;
  }

  static getControl(id: string) {
    return this.controls.getControlData(id);
  }

  static captureControlForInput(
    controlId: string,
    mode: "keyboard" | "gamepad" = "keyboard",
  ) {
    return new Promise((resolve) => {
      this._capturingMode = mode;
      setTimeout(() => {
        this._capturing = true;
        const inte = setInterval(() => {
          if (!this._capturing) {
            resolve(true);
            clearInterval(inte);
            if (!this._capturedData) return;
            this.updateControlInputData(controlId, this._capturedData);
          }
        }, 100);
      }, 200);
    });
  }

  static updateControlInputData(
    controlId: string,
    data: RecursivePartial<ControlInputData>,
  ) {
    const control = this.getControl(controlId);
    if (!control) {
      throw new Error(`Control with id: ${controlId} does not exists`);
    }
    for (const type in control.input) {
      //@ts-ignore
      if (!data[type]) continue;
      //@ts-ignore
      control.input[type] = { ...control.input[type], ...data[type] };
    }
    UserManager.updateControls();
  }

  static serializeInputData(): ControlData[] {
    const groups: ControlData[] = [];
    for (const [key, group] of this.controls._controlGroups) {
      for (const control of group.controls) {
        const clone = { ...control };
        delete (clone as any)["action"];
        groups.push(structuredClone(clone));
      }
    }
    return groups;
  }

  static injestInputData(data: ControlData[]) {
    for (const control of data) {
      const con = this.controls._controlData.get(control.id);
      if (!con) continue;
      this.controls._controlData.set(control.id, { ...con, ...control });
    }
    UserManager.updateControls();
  }

  static update() {
    GamepadManager.updateGamepads();
    ControlsInternal.runHoldUpdate();
  }
}
