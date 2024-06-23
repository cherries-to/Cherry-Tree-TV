let notify;

export default {
  names: {
    "Xbox 360 Controller (XInput STANDARD GAMEPAD)": "Xbox Controller",
    xinput: "Xbox Controller",
    "Wireless Gamepad (STANDARD GAMEPAD Vendor: 057e Product: 2009)":
      "Switch Pro Controller",
    "JC-W01U": "Wii Classic Controller",
    "Wireless Controller (STANDARD GAMEPAD Vendor: 054c Product: 09cc)":
      "DualShock 4",
    "usb gamepad            (Vendor: 0810 Product: e501)": "SNES Controller",
    "0810-e501-usb gamepad           ": "SNES Controller",
    "Wireless Gamepad (Vendor: 0000 Product: 0000)": "Generic Controller",
    "0079-1843-MAYFLASH GameCube Controller Adapter": "GameCube Controller",
    "Backbone Labs, Inc. ": "Backbone Controller",
  },
  mappings: {
    default: {
      up: "up",
      down: "down",
      left: "left",
      right: "right",
      button0: "confirm",
      button1: "back",
      button2: "act",
      button3: "alt",
      button12: "up",
      button13: "down",
      button14: "left",
      button15: "right",
      button16: "menu",
      button8: "menu",
      button9: "menu",
    },
    "Wii Classic Controller": "JC-W01U",
    "JC-W01U": {
      up: "up",
      down: "down",
      left: "left",
      right: "right",
      button3: "confirm",
      button2: "back",
      button0: "act",
      button1: "alt",
      button8: "menu",
      button9: "menu",
    },
    "Switch Pro Controller": {
      // L stick
      up1: "up",
      down1: "down",
      up0: "left",
      down0: "right",
      // ABXY
      button1: "confirm",
      button0: "back",
      button2: "act",
      button3: "alt",
      // SELECT / START
      button8: "menu",
      button9: "menu",
      // d-pad
      button12: "up",
      button13: "down",
      button14: "left",
      button15: "right",
      // home & capture
      // button16: "home",
      // button17: "capture",
    },
    "SNES Controller": {
      up: "up",
      down: "down",
      left: "left",
      right: "right",
      button1: "confirm",
      button2: "back",
      button3: "act",
      button0: "alt",
      button8: "menu",
      button9: "menu",
    },
    "GameCube Controller": {
      // L stick
      up: "up",
      down: "down",
      left: "left",
      right: "right",
      // ABXY
      button1: "confirm",
      button2: "back",
      button0: "act",
      button3: "alt",
      // SELECT / START
      button9: "menu",
      // d-pad
      button12: "up",
      button13: "right",
      button14: "down",
      button15: "left",
    },
  },
  labels: {
    default: {
      up: "Up",
      down: "Down",
      left: "Left",
      right: "Right",
      button0: "A",
      button1: "B",
      button2: "X",
      button3: "Y",
      button12: "D-Pad Up",
      button13: "D-Pad Down",
      button14: "D-Pad Left",
      button15: "D-Pad Right",
      button16: "Start",
      button8: "Select",
      button9: "Start",
    },
    "Wii Classic Controller": "JC-W01U",
    "JC-W01U": {
      up: "up",
      down: "down",
      left: "left",
      right: "right",
      button3: "A",
      button2: "B",
      button0: "Y",
      button1: "X",
      button8: "Select",
      button9: "Start",
    },
    "Switch Pro Controller": {
      // L stick
      up1: "L Up",
      down1: "L Down",
      up0: "L Left",
      down0: "L Right",
      // ABXY
      button1: "A",
      button0: "B",
      button2: "X",
      button3: "Y",
      // SELECT / START
      button8: "Select",
      button9: "Start",
      // d-pad
      button12: "D-Pad Up",
      button13: "D-Pad Down",
      button14: "D-Pad Left",
      button15: "D-Pad Right",
      // home & capture
      // button16: "home",
      // button17: "capture",
    },
    "SNES Controller": {
      up: "D-Pad Up",
      down: "D-Pad Down",
      left: "D-Pad Left",
      right: "D-Pad Right",
      button1: "A",
      button2: "B",
      button3: "Y",
      button0: "X",
      button8: "Select",
      button9: "Start",
    },
    "GameCube Controller": {
      // L stick
      up: "L Up",
      down: "L Down",
      left: "L Lef",
      right: "L Right",
      // ABXY
      button1: "A",
      button2: "B",
      button0: "X",
      button3: "Y",
      // SELECT / START
      button9: "Start",
      // d-pad
      button12: "D-Pad Up",
      button13: "D-Pad Right",
      button14: "D-Pad Down",
      button15: "D-Pad Left",
    },
  },
  parseControllerId(id) {
    const userAgent = navigator.userAgent;

    const isChrome = /Chrome/.test(userAgent);
    const isFirefox = /Firefox/.test(userAgent);

    const result = {};

    if (isChrome) {
      const regex = /(.+)\s\(Vendor:\s(\w+)\sProduct:\s(\w+)\)$/;
      const matches = id.match(regex);

      if (matches) {
        result.controllerName = matches[1];
        result.vendorID = matches[2];
        result.productID = matches[3];
      }
    } else if (isFirefox) {
      const regex = /^(\w+)-(\w+)-(.+)$/;
      const matches = id.match(regex);

      if (matches) {
        result.vendorID = matches[1];
        result.productID = matches[2];
        result.controllerName = matches[3];
      }
    }

    return result;
  },
  getGamepadName(id) {
    let result = this.parseControllerId(id);

    if (result.controllerName && this.names[result.controllerName]) {
      return this.names[result.controllerName];
    } else if (this.names[id]) {
      return this.names[id];
    } else {
      return id;
    }
  },
  init(n) {
    notify = n;
  },
  setup(gamepad) {
    let formalGamepadName;

    formalGamepadName = this.getGamepadName(gamepad.name);

    console.log("Gp controller name", formalGamepadName);

    console.log("A new gamepad was connected!", gamepad);
    window.gps.push(gamepad);
    if (notify) notify("A new gamepad was connected!", formalGamepadName);
    else {
      let loop = setInterval((_) => {
        if (notify !== undefined) {
          clearInterval(loop);
          notify("A new gamepad was connected!", formalGamepadName);
        }
      }, 1000);
    }

    let holding = [
      false,
      false,
      false,
      false,
      false,
      false,
      false,
      false,
      false,
      false,
      false,
      false,
    ];

    function setHoldingTimeout(index, id) {
      holding[index] = true;
      // Delay before repeating
      setTimeout(() => {
        if (holding[index] === true) {
          // Scroll
          let x = setInterval(function () {
            if (holding[index] === true) {
              window.Libs.Input.pop(
                id,
                window.gps.findIndex((g) => g.id === gamepad.id)
              );
            } else clearInterval(x);
          }, 100);
        }
      }, 350);
    }

    function popInput(i) {
      const p = window.gps.findIndex((g) => g.id === gamepad.id);
      window.Libs.Input.pop(i, p);
    }

    let mapping = this.mappings[formalGamepadName];

    if (mapping === undefined) {
      mapping = this.mappings.default;
    }

    while (typeof mapping === "string") {
      mapping = this.mappings[mapping];
    }

    let holdableInputs = [
      "up",
      "down",
      "left",
      "right",
      "confirm",
      "back",
      "act",
      "alt",
    ];
    let i = 0;
    for (let key in mapping) {
      let j = parseInt(i);
      // if (holdableInputs.includes(mapping[key])) {
      //   gamepad.before(key, (_) => {
      //     popInput(mapping[key]);
      //     setHoldingTimeout(i, mapping[key]);
      //   });
      //   gamepad.after(key, (_) => {
      //     console.log(i, j);
      //     // holding[j] = false
      //   });
      // } else {
      gamepad.before(key, (_) => {
        popInput(mapping[key]);
      });
      // }

      i++;
    }

    // gamepad.before("up", (_) => {
    //   popInput("up");
    //   setHoldingTimeout(0, "up");
    // });
    // gamepad.before("down", (_) => {
    //   popInput("down");
    //   setHoldingTimeout(1, "down");
    // });
    // gamepad.before("left", (_) => {
    //   popInput("left");
    //   setHoldingTimeout(2, "left");
    // });
    // gamepad.before("right", (_) => {
    //   popInput("right");
    //   setHoldingTimeout(3, "right");
    // });
    // gamepad.before("button0", (_) => {
    //   popInput("confirm");
    //   setHoldingTimeout(4, "confirm");
    // });
    // gamepad.before("button1", (_) => {
    //   popInput("back");
    //   setHoldingTimeout(5, "back");
    // });
    // gamepad.before("button2", (_) => {
    //   popInput("act");
    //   setHoldingTimeout(6, "act");
    // });
    // gamepad.before("button3", (_) => {
    //   popInput("alt");
    //   setHoldingTimeout(7, "alt");
    // });
    // gamepad.before("button12", (_) => popInput("up"));
    // gamepad.before("button13", (_) => popInput("down"));
    // gamepad.before("button14", (_) => popInput("left"));
    // gamepad.before("button15", (_) => popInput("right"));

    // gamepad.before("button16", (_) => popInput("menu"));
    // gamepad.before("button8", (_) => popInput("menu"));
    // gamepad.before("button9", (_) => popInput("menu"));

    // gamepad.after("up", (_) => (holding[0] = false));
    // gamepad.after("down", (_) => (holding[1] = false));
    // gamepad.after("left", (_) => (holding[2] = false));
    // gamepad.after("right", (_) => (holding[3] = false));
    // gamepad.after("button0", (_) => (holding[4] = false));
    // gamepad.after("button1", (_) => (holding[5] = false));
    // gamepad.after("button2", (_) => (holding[6] = false));
    // gamepad.after("button3", (_) => (holding[7] = false));
    // gamepad.after("button12", (_) => (holding[8] = false));
    // gamepad.after("button13", (_) => (holding[9] = false));
    // gamepad.after("button14", (_) => (holding[10] = false));
    // gamepad.after("button15", (_) => (holding[11] = false));
  },
};
