import { GamepadManager } from "../Gamepads/GamepadManager";
import { UserManager } from "../Users/UserManager";
import { Controls } from "../Controls";

import { ControlsMap } from "./ControlsMap";
import { ControlEventManager } from "../Events/ControlsEventManager";
import { ControlEventTypes } from "../Events/Event.types";
import { ControlsInternal } from "./ControlsInternal";

export default function (controls: typeof Controls) {
  const rootElement = controls.controlRootElement as HTMLElement;
  const user = UserManager.addUser(0);
  controls.mainUser = user;

  const heldKeybaordKey = new Set();
  const gamePadConnectionListener = (e: GamepadEvent) => {
    const newGamepad = GamepadManager.addGamepad(e);
    newGamepad.observables.buttonPressed.subscribe(
      Controls,
      ({ number, key }) => {
        if (controls._capturing && controls._capturingMode == "gamepad") {
          controls._capturedData = {
            "gamepad-button": {
              button: key as any,
            },
          };
          controls._capturing = false;
          return;
        }
      }
    );
  };

  const gamePaddisconnectListener = (e: GamepadEvent) =>
    GamepadManager.removeGamepad(e);

  const pointerDownListener = (event: MouseEvent) => {
    const button = ControlsMap.mapMoueButton(event.button);
    if (controls._capturing && controls._capturingMode == "keyboard") {
      controls._capturedData = {
        pointer: {
          mode: "down",
          button: button,
        },
      };
      controls._capturing = false;
      return;
    }

    const downControl = user.getControlByType(
      ControlsMap.getMouseId(button, "down")
    );
    downControl &&
      downControl.run(
        new (ControlEventManager.getEvent(ControlEventTypes.PointerDown)!)(
          downControl,
          event
        )
      );

    const holdControl = user.getControlByType(
      ControlsMap.getMouseId(button, "hold")
    );
    if (holdControl && !ControlsInternal.hasHold(button)) {
      holdControl.run(
        new (ControlEventManager.getEvent(ControlEventTypes.PointerHold)!)(
          holdControl,
          event
        )
      );

      const input = holdControl.data.input;
      ControlsInternal.addHold(
        button,
        () =>
          holdControl.run(
            new (ControlEventManager.getEvent(ControlEventTypes.PointerHold)!)(
              holdControl,
              event
            )
          ),
        input.pointer?.holdDelay ? input.pointer?.holdDelay : 10,
        input.pointer?.initHoldDelay ? input.pointer?.initHoldDelay : 250
      );
    }
  };

  const pointerUpListener = (event: MouseEvent) => {
    const button = ControlsMap.mapMoueButton(event.button);
    ControlsInternal.removeHold(button);
    ControlsInternal.releaseMouseButton(`${event.button}`);

    const key = ControlsMap.getMouseId(button, "up");
    const control = user.getControlByType(key);
    control &&
      control.run(
        new (ControlEventManager.getEvent(ControlEventTypes.PointerUp)!)(
          control,
          event
        )
      );
  };

  const keyDownListener = (event: KeyboardEvent) => {
    const keyBoardKey = ControlsMap.mapKey(event.key);

    if (controls._capturing && controls._capturingMode == "keyboard") {
      controls._capturedData = {
        keyboard: {
          key: keyBoardKey,
          mode: "down",
        },
      };
      controls._capturing = false;
      return;
    }

    const downControl = user.getControlByType(
      ControlsMap.getKeyBaordId(keyBoardKey, "down")
    );
    if (downControl && !heldKeybaordKey.has(event.key)) {
      downControl.run(
        new (ControlEventManager.getEvent(ControlEventTypes.KeyBoardDown)!)(
          downControl,
          event
        )
      );
      heldKeybaordKey.add(event.key);
    }

    const holdControl = user.getControlByType(
      ControlsMap.getKeyBaordId(keyBoardKey, "hold")
    );
    if (holdControl && !ControlsInternal.hasHold(keyBoardKey)) {
      holdControl.run(
        new (ControlEventManager.getEvent(ControlEventTypes.KeyBoardHold)!)(
          holdControl,
          event
        )
      );
      const input = holdControl.data.input;
      ControlsInternal.addHold(
        keyBoardKey,
        () =>
          holdControl.run(
            new (ControlEventManager.getEvent(ControlEventTypes.KeyBoardHold)!)(
              holdControl,
              event
            )
          ),
        input.keyboard?.holdDelay ? input.keyboard?.holdDelay : 10,
        input.keyboard?.initHoldDelay ? input.keyboard?.initHoldDelay : 250
      );
    }
  };

  const keyUpListener = (event: KeyboardEvent) => {
    const keyBoardKey = ControlsMap.mapKey(event.key);

    ControlsInternal.removeHold(keyBoardKey);
    ControlsInternal.releaseKey(event.key);
    heldKeybaordKey.delete(event.key);
    const key = ControlsMap.getKeyBaordId(keyBoardKey, "up");
    const control = user.getControlByType(key);
    control &&
      control.run(
        new (ControlEventManager.getEvent(ControlEventTypes.KeyBoardUp)!)(
          control,
          event
        )
      );
  };

  const wheelListener = (event: WheelEvent) => {
    if (event.deltaY < 0) {
      if (controls._capturing && controls._capturingMode == "keyboard") {
        controls._capturedData = {
          scroll: {
            mode: "up",
          },
        };
        controls._capturing = false;
        return;
      }
      const key = ControlsMap.getScrollId("up");
      const control = user.getControlByType(key);
      control &&
        control.run(
          new (ControlEventManager.getEvent(ControlEventTypes.WheelUp)!)(
            control,
            event
          )
        );
    } else {
      if (controls._capturing && controls._capturingMode == "keyboard") {
        controls._capturedData = {
          scroll: {
            mode: "down",
          },
        };
        controls._capturing = false;
        return;
      }
      const key = ControlsMap.getScrollId("down");
      const control = user.getControlByType(key);

      control &&
        control.run(
          new (ControlEventManager.getEvent(ControlEventTypes.WheelDown)!)(
            control,
            event
          )
        );
    }
  };

  const addListeners = () => {
    window.addEventListener("gamepadconnected", gamePadConnectionListener);
    window.addEventListener("gamepaddisconnected", gamePaddisconnectListener);
    rootElement.addEventListener("pointerdown", pointerDownListener);
    rootElement.addEventListener("pointerup", pointerUpListener);
    rootElement.addEventListener("wheel", wheelListener);
    rootElement.addEventListener("keydown", keyDownListener);
    rootElement.addEventListener("keyup", keyUpListener);
  };
  const removeListeners = () => {
    window.removeEventListener("gamepadconnected", gamePadConnectionListener);
    window.removeEventListener(
      "gamepaddisconnected",
      gamePaddisconnectListener
    );
    rootElement.removeEventListener("pointerdown", pointerDownListener);
    rootElement.removeEventListener("pointerup", pointerUpListener);
    rootElement.removeEventListener("wheel", wheelListener);
    rootElement.removeEventListener("keydown", keyDownListener);
    rootElement.removeEventListener("keyup", keyUpListener);
  };

  addListeners();

  return {
    addListeners,
    removeListeners,
  };
}
