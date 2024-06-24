import controllerMapping from "./controllerMapping.js";

export const buttons = [
  "left",
  "right",
  "up",
  "down",
  "confirm",
  "back",
  "act",
  "alt",
  "menu",
];

export function getFriendlyButtonName(playerNumber, button) {
  switch (playerNumber) {
    case 0:
    case 1:
    case 2:
    case 3: // Controller
      let map =
        controllerMapping.mappings[
          controllerMapping.getGamepadName(window.gps[playerNumber].name) ||
            "default"
        ];
      let label =
        controllerMapping.labels[
          controllerMapping.getGamepadName(window.gps[playerNumber].name) ||
            "default"
        ];

      for (const key in map) {
        if (map[key] === button) {
          if (label[key]) {
            return label[key];
          }
        }
      }

      return button;

    case 4: // Keyboard
      switch (button) {
        case "left":
          return "Left Arrow";
        case "right":
          return "Right Arrow";
        case "up":
          return "Up Arrow";
        case "down":
          return "Down Arrow";
        case "confirm":
          return "Enter";
        case "back":
          return "Backspace";
        case "act":
          return "Control";
        case "alt":
          return "Backslash";
        case "menu":
          return "Escape";
        default:
          return button;
      }
    case 5: // TV Remote
      switch (button) {
        case "left":
          return "&larr;";
        case "right":
          return "&rarr;";
        case "up":
          return "&uarr;";
        case "down":
          return "&darr;";
        case "confirm":
          return "OK";
        case "back":
          return `<svg
                xmlns="http://www.w3.org/2000/svg"
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
                class="lucide lucide-arrow-left-to-line"
              >
                <path d="M3 19V5" />
                <path d="m13 6-6 6 6 6" />
                <path d="M7 12h14" />
              </svg>`;
        case "menu":
          return `<svg
                xmlns="http://www.w3.org/2000/svg"
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
                class="lucide lucide-menu"
              >
                <line x1="4" x2="20" y1="12" y2="12" />
                <line x1="4" x2="20" y1="6" y2="6" />
                <line x1="4" x2="20" y1="18" y2="18" />
              </svg>`;
        case "act":
        case "alt":
          return "No button available :(";
        default:
          return button;
      }
    default:
      return button;
  }
}
