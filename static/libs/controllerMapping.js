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
    "18d1-9400-Unknown Gamepad": "Stadia Controller",
    "18d1-9400-Stadia Controller rev. A": "Stadia Controller",
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
    "Xbox Controller": "default",
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
    "Stadia Controller": {
      up: "up",
      down: "down",
      left: "left",
      right: "right",
      button0: "confirm",
      button1: "back",
      button3: "act",
      button4: "alt",
      button10: "menu",
      button11: "menu",
      button12: "menu",
      button16: "menu",
      button17: "menu",
    },
  },
  labels: {
    default: {
      // D-Pad Up
      up: `<svg width="39" height="38" viewBox="0 0 39 38" fill="none" xmlns="http://www.w3.org/2000/svg">
<rect x="14.3574" width="10.8571" height="13.5714" fill="#414141"/>
<rect x="14.3574" y="24.4297" width="10.8571" height="13.5714" fill="#414141"/>
<rect x="14.3574" y="24.4297" width="10.8571" height="10.8571" transform="rotate(-90 14.3574 24.4297)" fill="#414141"/>
<rect x="25.2148" y="13.5703" width="13.5714" height="10.8571" fill="#414141"/>
<rect x="0.786133" y="13.5703" width="13.5714" height="10.8571" fill="#414141"/>
<path d="M14.3574 0V13.5714L19.786 20.0179L25.2146 13.5714V0H14.3574Z" fill="white" fill-opacity="0.26"/>
</svg>`,
      // D-Pad Down
      down: `<svg width="39" height="38" viewBox="0 0 39 38" fill="none" xmlns="http://www.w3.org/2000/svg">
<rect x="24.8594" y="38" width="10.8571" height="13.5714" transform="rotate(-180 24.8594 38)" fill="#414141"/>
<rect x="24.8594" y="13.5723" width="10.8571" height="13.5714" transform="rotate(-180 24.8594 13.5723)" fill="#414141"/>
<rect x="24.8594" y="13.5723" width="10.8571" height="10.8571" transform="rotate(90 24.8594 13.5723)" fill="#414141"/>
<rect x="14.002" y="24.4297" width="13.5714" height="10.8571" transform="rotate(-180 14.002 24.4297)" fill="#414141"/>
<rect x="38.4297" y="24.4297" width="13.5714" height="10.8571" transform="rotate(-180 38.4297 24.4297)" fill="#414141"/>
<path d="M24.8594 38L24.8594 24.4286L19.4308 17.9821L14.0022 24.4286L14.0022 38L24.8594 38Z" fill="white" fill-opacity="0.26"/>
</svg>`,
      // D-Pad Left
      left: `<svg width="39" height="38" viewBox="0 0 39 38" fill="none" xmlns="http://www.w3.org/2000/svg">
<rect x="0.212891" y="24.4297" width="10.8571" height="13.5714" transform="rotate(-90 0.212891 24.4297)" fill="#414141"/>
<rect x="24.6426" y="24.4297" width="10.8571" height="13.5714" transform="rotate(-90 24.6426 24.4297)" fill="#414141"/>
<rect x="24.6426" y="24.4297" width="10.8571" height="10.8571" transform="rotate(180 24.6426 24.4297)" fill="#414141"/>
<rect x="13.7832" y="13.5723" width="13.5714" height="10.8571" transform="rotate(-90 13.7832 13.5723)" fill="#414141"/>
<rect x="13.7832" y="38" width="13.5714" height="10.8571" transform="rotate(-90 13.7832 38)" fill="#414141"/>
<path d="M0.212891 24.4297L13.7843 24.4297L20.2307 19.0011L13.7843 13.5725L0.21289 13.5725L0.212891 24.4297Z" fill="white" fill-opacity="0.26"/>
</svg>`,
      // D-Pad Right
      right: `<svg width="38" height="38" viewBox="0 0 38 38" fill="none" xmlns="http://www.w3.org/2000/svg">
<rect x="38" y="13.5703" width="10.8571" height="13.5714" transform="rotate(90 38 13.5703)" fill="#414141"/>
<rect x="13.5723" y="13.5703" width="10.8571" height="13.5714" transform="rotate(90 13.5723 13.5703)" fill="#414141"/>
<rect x="13.5723" y="13.5703" width="10.8571" height="10.8571" fill="#414141"/>
<rect x="24.4297" y="24.4297" width="13.5714" height="10.8571" transform="rotate(90 24.4297 24.4297)" fill="#414141"/>
<rect x="24.4297" width="13.5714" height="10.8571" transform="rotate(90 24.4297 0)" fill="#414141"/>
<path d="M38 13.5703L24.4286 13.5703L17.9821 18.9989L24.4286 24.4275L38 24.4275L38 13.5703Z" fill="white" fill-opacity="0.26"/>
</svg>`,
      // A
      button0: `<svg width="38" height="38" viewBox="0 0 38 38" fill="none" xmlns="http://www.w3.org/2000/svg">
<circle cx="19" cy="19" r="17" fill="#21B219" stroke="url(#paint0_linear_641_44)" stroke-width="4"/>
<path d="M12.1094 26L17.3804 11.51H19.1444L19.3124 14.786L15.5954 26H12.1094ZM15.6584 23.144V20.477H22.5044V23.144H15.6584ZM18.5984 14.786L18.6824 11.51H20.6144L25.8854 26H22.3154L18.5984 14.786Z" fill="white"/>
<defs>
<linearGradient id="paint0_linear_641_44" x1="19" y1="0" x2="19" y2="38" gradientUnits="userSpaceOnUse">
<stop stop-color="white" stop-opacity="0.1"/>
<stop offset="1" stop-opacity="0.45"/>
</linearGradient>
</defs>
</svg>`,
      // B
      button1: `<svg width="38" height="38" viewBox="0 0 38 38" fill="none" xmlns="http://www.w3.org/2000/svg">
<circle cx="19" cy="19" r="17" fill="#EC4848" stroke="url(#paint0_linear_641_45)" stroke-width="4"/>
<path d="M13.9149 26V11.51H17.2749V26H13.9149ZM15.4689 26V23.186H19.5219C20.0819 23.186 20.5299 23.053 20.8659 22.787C21.2159 22.507 21.3909 22.101 21.3909 21.569C21.3909 21.037 21.2159 20.638 20.8659 20.372C20.5299 20.092 20.0819 19.952 19.5219 19.952H15.4689V17.852H19.8369C20.8309 17.852 21.6989 18.027 22.4409 18.377C23.1829 18.713 23.7639 19.196 24.1839 19.826C24.6039 20.442 24.8139 21.17 24.8139 22.01C24.8139 22.85 24.5899 23.571 24.1419 24.173C23.7079 24.761 23.1129 25.216 22.3569 25.538C21.6149 25.846 20.7749 26 19.8369 26H15.4689ZM15.4689 19.112V17.348H19.1019C19.6339 17.348 20.0609 17.222 20.3829 16.97C20.7049 16.704 20.8659 16.326 20.8659 15.836C20.8659 15.346 20.7049 14.975 20.3829 14.723C20.0609 14.457 19.6339 14.324 19.1019 14.324H15.4689V11.51H19.3119C20.2219 11.51 21.0479 11.671 21.7899 11.993C22.5319 12.301 23.1129 12.742 23.5329 13.316C23.9669 13.89 24.1839 14.583 24.1839 15.395C24.1839 16.207 23.9669 16.893 23.5329 17.453C23.1129 17.999 22.5319 18.412 21.7899 18.692C21.0619 18.972 20.2359 19.112 19.3119 19.112H15.4689Z" fill="white"/>
<defs>
<linearGradient id="paint0_linear_641_45" x1="19" y1="0" x2="19" y2="38" gradientUnits="userSpaceOnUse">
<stop stop-color="white" stop-opacity="0.1"/>
<stop offset="1" stop-opacity="0.45"/>
</linearGradient>
</defs>
</svg>`,
      // X
      button2: `<svg width="38" height="38" viewBox="0 0 38 38" fill="none" xmlns="http://www.w3.org/2000/svg">
<circle cx="19" cy="19" r="17" fill="#487FEC" stroke="url(#paint0_linear_641_46)" stroke-width="4"/>
<path d="M12.5528 26L17.5718 17.936L18.7688 16.382L21.4778 11.51H25.2368L20.4488 19.217L19.2518 20.75L16.3118 26H12.5528ZM12.7628 11.51H16.6268L19.9448 17.159L25.4468 26H21.5828L18.0968 20.078L12.7628 11.51Z" fill="white"/>
<defs>
<linearGradient id="paint0_linear_641_46" x1="19" y1="0" x2="19" y2="38" gradientUnits="userSpaceOnUse">
<stop stop-color="white" stop-opacity="0.1"/>
<stop offset="1" stop-opacity="0.45"/>
</linearGradient>
</defs>
</svg>`,
      // Y
      button3: `<svg width="38" height="38" viewBox="0 0 38 38" fill="none" xmlns="http://www.w3.org/2000/svg">
<circle cx="19" cy="19" r="17" fill="#ECB048" stroke="url(#paint0_linear_641_47)" stroke-width="4"/>
<path d="M12.1094 11.51H15.9734L19.3964 17.663L19.3124 20.54H17.5904L12.1094 11.51ZM17.3174 26V19.91H20.6774V26H17.3174ZM18.6824 17.663L22.1054 11.51H25.8854L20.4044 20.54H18.8504L18.6824 17.663Z" fill="white"/>
<defs>
<linearGradient id="paint0_linear_641_47" x1="19" y1="0" x2="19" y2="38" gradientUnits="userSpaceOnUse">
<stop stop-color="white" stop-opacity="0.1"/>
<stop offset="1" stop-opacity="0.45"/>
</linearGradient>
</defs>
</svg>`,
      // D-Pad Up
      button12: `<svg width="39" height="38" viewBox="0 0 39 38" fill="none" xmlns="http://www.w3.org/2000/svg">
<rect x="14.3574" width="10.8571" height="13.5714" fill="#414141"/>
<rect x="14.3574" y="24.4297" width="10.8571" height="13.5714" fill="#414141"/>
<rect x="14.3574" y="24.4297" width="10.8571" height="10.8571" transform="rotate(-90 14.3574 24.4297)" fill="#414141"/>
<rect x="25.2148" y="13.5703" width="13.5714" height="10.8571" fill="#414141"/>
<rect x="0.786133" y="13.5703" width="13.5714" height="10.8571" fill="#414141"/>
<path d="M14.3574 0V13.5714L19.786 20.0179L25.2146 13.5714V0H14.3574Z" fill="white" fill-opacity="0.26"/>
</svg>`,
      // D-Pad Down
      button13: `<svg width="39" height="38" viewBox="0 0 39 38" fill="none" xmlns="http://www.w3.org/2000/svg">
<rect x="24.8594" y="38" width="10.8571" height="13.5714" transform="rotate(-180 24.8594 38)" fill="#414141"/>
<rect x="24.8594" y="13.5723" width="10.8571" height="13.5714" transform="rotate(-180 24.8594 13.5723)" fill="#414141"/>
<rect x="24.8594" y="13.5723" width="10.8571" height="10.8571" transform="rotate(90 24.8594 13.5723)" fill="#414141"/>
<rect x="14.002" y="24.4297" width="13.5714" height="10.8571" transform="rotate(-180 14.002 24.4297)" fill="#414141"/>
<rect x="38.4297" y="24.4297" width="13.5714" height="10.8571" transform="rotate(-180 38.4297 24.4297)" fill="#414141"/>
<path d="M24.8594 38L24.8594 24.4286L19.4308 17.9821L14.0022 24.4286L14.0022 38L24.8594 38Z" fill="white" fill-opacity="0.26"/>
</svg>`,
      // D-Pad Left
      button14: `<svg width="39" height="38" viewBox="0 0 39 38" fill="none" xmlns="http://www.w3.org/2000/svg">
<rect x="0.212891" y="24.4297" width="10.8571" height="13.5714" transform="rotate(-90 0.212891 24.4297)" fill="#414141"/>
<rect x="24.6426" y="24.4297" width="10.8571" height="13.5714" transform="rotate(-90 24.6426 24.4297)" fill="#414141"/>
<rect x="24.6426" y="24.4297" width="10.8571" height="10.8571" transform="rotate(180 24.6426 24.4297)" fill="#414141"/>
<rect x="13.7832" y="13.5723" width="13.5714" height="10.8571" transform="rotate(-90 13.7832 13.5723)" fill="#414141"/>
<rect x="13.7832" y="38" width="13.5714" height="10.8571" transform="rotate(-90 13.7832 38)" fill="#414141"/>
<path d="M0.212891 24.4297L13.7843 24.4297L20.2307 19.0011L13.7843 13.5725L0.21289 13.5725L0.212891 24.4297Z" fill="white" fill-opacity="0.26"/>
</svg>`,
      // D-Pad Right
      button15: `<svg width="38" height="38" viewBox="0 0 38 38" fill="none" xmlns="http://www.w3.org/2000/svg">
<rect x="38" y="13.5703" width="10.8571" height="13.5714" transform="rotate(90 38 13.5703)" fill="#414141"/>
<rect x="13.5723" y="13.5703" width="10.8571" height="13.5714" transform="rotate(90 13.5723 13.5703)" fill="#414141"/>
<rect x="13.5723" y="13.5703" width="10.8571" height="10.8571" fill="#414141"/>
<rect x="24.4297" y="24.4297" width="13.5714" height="10.8571" transform="rotate(90 24.4297 24.4297)" fill="#414141"/>
<rect x="24.4297" width="13.5714" height="10.8571" transform="rotate(90 24.4297 0)" fill="#414141"/>
<path d="M38 13.5703L24.4286 13.5703L17.9821 18.9989L24.4286 24.4275L38 24.4275L38 13.5703Z" fill="white" fill-opacity="0.26"/>
</svg>`,
      // Menu
      button16: `<svg width="38" height="38" viewBox="0 0 38 38" fill="none" xmlns="http://www.w3.org/2000/svg">
<circle cx="19" cy="19" r="17" fill="#2C2C2C" stroke="url(#paint0_linear_641_29)" stroke-width="4"/>
<rect x="11" y="12" width="16" height="3" fill="white"/>
<rect x="11" y="18" width="16" height="3" fill="white"/>
<rect x="11" y="24" width="16" height="3" fill="white"/>
<defs>
<linearGradient id="paint0_linear_641_29" x1="19" y1="0" x2="19" y2="38" gradientUnits="userSpaceOnUse">
<stop stop-color="white" stop-opacity="0.1"/>
<stop offset="1" stop-opacity="0.45"/>
</linearGradient>
</defs>
</svg>`,
      // View
      button8: `<svg width="38" height="38" viewBox="0 0 38 38" fill="none" xmlns="http://www.w3.org/2000/svg">
<circle cx="19" cy="19" r="17" fill="#2C2C2C" stroke="url(#paint0_linear_641_43)" stroke-width="4"/>
<rect x="16" y="16" width="12" height="10" stroke="white" stroke-width="2"/>
<path d="M17 16H16V17V22H10V12H24V16H17Z" stroke="white" stroke-width="2"/>
<defs>
<linearGradient id="paint0_linear_641_43" x1="19" y1="0" x2="19" y2="38" gradientUnits="userSpaceOnUse">
<stop stop-color="white" stop-opacity="0.1"/>
<stop offset="1" stop-opacity="0.45"/>
</linearGradient>
</defs>
</svg>`,
      // Menu
      button9: `<svg width="38" height="38" viewBox="0 0 38 38" fill="none" xmlns="http://www.w3.org/2000/svg">
<circle cx="19" cy="19" r="17" fill="#2C2C2C" stroke="url(#paint0_linear_641_29)" stroke-width="4"/>
<rect x="11" y="12" width="16" height="3" fill="white"/>
<rect x="11" y="18" width="16" height="3" fill="white"/>
<rect x="11" y="24" width="16" height="3" fill="white"/>
<defs>
<linearGradient id="paint0_linear_641_29" x1="19" y1="0" x2="19" y2="38" gradientUnits="userSpaceOnUse">
<stop stop-color="white" stop-opacity="0.1"/>
<stop offset="1" stop-opacity="0.45"/>
</linearGradient>
</defs>
</svg>`,
    },
    "Xbox Controller": "default",
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

    let holdingTimeouts = {};
    let holdingIntervals = {};

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

    function beginHoldingTimeout(key) {
      holdingTimeouts[key] = setTimeout(() => {
        console.log(`${key} is still Held!`);
        if (holdingIntervals[key]) clearInterval(holdingIntervals[key]);
        holdingIntervals[key] = setInterval(() => {
          popInput(mapping[key]);
        }, 100);
      }, 330);
    }
    function clearHoldingTimeout(key) {
      clearTimeout(holdingTimeouts[key]);
      clearInterval(holdingIntervals[key]);
    }

    for (let key in mapping) {
      let j = parseInt(i);

      gamepad.before(key, (_) => {
        popInput(mapping[key]);

        beginHoldingTimeout(mapping[key]);
      });
      gamepad.after(key, (_) => {
        clearHoldingTimeout(mapping[key]);
      });

      i++;
    }
  },
};
