import Html from "/libs/html.js";
import { Peer } from "https://esm.sh/peerjs@1.5.4?bundle-deps";

const pkg = {
  name: "Status Indicator",
  type: "app",
  privs: 0,
  start: async function (Root) {
    const controller = new Html("div")
      .html(
        `<svg width="100%" height="100%" viewBox="0 0 22 25" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M11 17C15.4183 17 19 13.4183 19 9C19 4.58172 15.4183 1 11 1C6.58172 1 3 4.58172 3 9C3 13.4183 6.58172 17 11 17Z" fill="#707070" fill-opacity="0.35" stroke="#707070" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><rect y="21" width="22" height="4" rx="1" fill="#707070"/><path d="M8 12L14 6" stroke="#707070" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>`
      )
      .style({ width: "2rem", height: "2rem" });

    const time = new Html("span").style({ "font-size": "1.5rem" });
    const code = new Html("span").style({ "font-size": "1.5rem" });

    const statusBar = new Html("div")
      .style({
        position: "fixed",
        top: "4.5rem",
        right: "4rem",
        "z-index": 1000000,
      })
      .class("flex-row")
      .appendMany(code, controller, time)
      .appendTo("body");

    function updateTime() {
      let d = new Date();
      time.text(
        `${d.getHours().toString().padStart(2, "0")}:${d
          .getMinutes()
          .toString()
          .padStart(2, "0")}`
      );
    }

    updateTime();
    setInterval(updateTime, 1000);

    if ((await localforage.getItem("settings__phoneLink")) === null) {
      await localforage.setItem("settings__phoneLink", true);
    }

    const controllerTypes = [
      // player 1 (purple)
      `<svg width="100%" height="100%" viewBox="0 0 22 26" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="7.33301" y="21" width="4.19048" height="4" rx="1" fill="#686675"/><rect x="12.5713" y="21" width="4.19048" height="4" rx="1" fill="#686675"/><rect x="17.8096" y="21" width="4.19048" height="4" rx="1" fill="#686675"/><rect y="20" width="6.28571" height="6" rx="1" fill="#9D92E8"/><path d="M16.32 1H5.68C4.69028 1.00023 3.73579 1.36738 3.00103 2.03046C2.26628 2.69355 1.80345 3.60549 1.702 4.59C1.696 4.642 1.692 4.691 1.685 4.742C1.604 5.416 1 10.456 1 12C1 12.7956 1.31607 13.5587 1.87868 14.1213C2.44129 14.6839 3.20435 15 4 15C5 15 5.5 14.5 6 14L7.414 12.586C7.78899 12.2109 8.29761 12.0001 8.828 12H13.172C13.7024 12.0001 14.211 12.2109 14.586 12.586L16 14C16.5 14.5 17 15 18 15C18.7956 15 19.5587 14.6839 20.1213 14.1213C20.6839 13.5587 21 12.7956 21 12C21 10.455 20.396 5.416 20.315 4.742C20.308 4.692 20.304 4.642 20.298 4.591C20.1968 3.60631 19.7341 2.69413 18.9993 2.03083C18.2645 1.36754 17.3099 1.00026 16.32 1Z" fill="#9D92E8" fill-opacity="0.31" stroke="#9D92E8" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path d="M5 7H9" stroke="#9D92E8" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path d="M7 5V9" stroke="#9D92E8" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path d="M14 8H14.01" stroke="#9D92E8" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path d="M17 6H17.01" stroke="#9D92E8" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
      // player 2 (blue)
      `<svg width="100%" height="100%" viewBox="0 0 22 26" fill="none" xmlns="http://www.w3.org/2000/svg"><rect y="21" width="4.19048" height="4" rx="1" fill="#686675"/><rect x="12.5713" y="21" width="4.19048" height="4" rx="1" fill="#686675"/><rect x="17.8096" y="21" width="4.19048" height="4" rx="1" fill="#686675"/><rect x="5.23828" y="20" width="6.28571" height="6" rx="1" fill="#92B1E8"/><path d="M16.32 1H5.68C4.69028 1.00023 3.73579 1.36738 3.00103 2.03046C2.26628 2.69355 1.80345 3.60549 1.702 4.59C1.696 4.642 1.692 4.691 1.685 4.742C1.604 5.416 1 10.456 1 12C1 12.7956 1.31607 13.5587 1.87868 14.1213C2.44129 14.6839 3.20435 15 4 15C5 15 5.5 14.5 6 14L7.414 12.586C7.78899 12.2109 8.29761 12.0001 8.828 12H13.172C13.7024 12.0001 14.211 12.2109 14.586 12.586L16 14C16.5 14.5 17 15 18 15C18.7956 15 19.5587 14.6839 20.1213 14.1213C20.6839 13.5587 21 12.7956 21 12C21 10.455 20.396 5.416 20.315 4.742C20.308 4.692 20.304 4.642 20.298 4.591C20.1968 3.60631 19.7341 2.69413 18.9993 2.03083C18.2645 1.36754 17.3099 1.00026 16.32 1Z" fill="#92B2E8" fill-opacity="0.31" stroke="#92B2E8" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path d="M5 7H9" stroke="#92B2E8" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path d="M7 5V9" stroke="#92B2E8" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path d="M14 8H14.01" stroke="#92B2E8" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path d="M17 6H17.01" stroke="#92B2E8" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
      // player 3 (teal)
      `<svg width="100%" height="100%" viewBox="0 0 22 26" fill="none" xmlns="http://www.w3.org/2000/svg"><rect y="21" width="4.19048" height="4" rx="1" fill="#686675"/><rect x="5.23828" y="21" width="4.19048" height="4" rx="1" fill="#686675"/><rect x="17.8096" y="21" width="4.19048" height="4" rx="1" fill="#686675"/><rect x="10.4766" y="20" width="6.28571" height="6" rx="1" fill="#92D9E8"/><path d="M16.32 1H5.68C4.69028 1.00023 3.73579 1.36738 3.00103 2.03046C2.26628 2.69355 1.80345 3.60549 1.702 4.59C1.696 4.642 1.692 4.691 1.685 4.742C1.604 5.416 1 10.456 1 12C1 12.7956 1.31607 13.5587 1.87868 14.1213C2.44129 14.6839 3.20435 15 4 15C5 15 5.5 14.5 6 14L7.414 12.586C7.78899 12.2109 8.29761 12.0001 8.828 12H13.172C13.7024 12.0001 14.211 12.2109 14.586 12.586L16 14C16.5 14.5 17 15 18 15C18.7956 15 19.5587 14.6839 20.1213 14.1213C20.6839 13.5587 21 12.7956 21 12C21 10.455 20.396 5.416 20.315 4.742C20.308 4.692 20.304 4.642 20.298 4.591C20.1968 3.60631 19.7341 2.69413 18.9993 2.03083C18.2645 1.36754 17.3099 1.00026 16.32 1Z" fill="#92DAE8" fill-opacity="0.31" stroke="#92DAE8" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path d="M5 7H9" stroke="#92DAE8" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path d="M7 5V9" stroke="#92DAE8" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path d="M14 8H14.01" stroke="#92DAE8" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path d="M17 6H17.01" stroke="#92DAE8" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
      // player 4 (lime)
      `<svg width="100%" height="100%" viewBox="0 0 22 26" fill="none" xmlns="http://www.w3.org/2000/svg"><rect y="21" width="4.19048" height="4" rx="1" fill="#686675"/><rect x="5.23828" y="21" width="4.19048" height="4" rx="1" fill="#686675"/><rect x="10.4766" y="21" width="4.19048" height="4" rx="1" fill="#686675"/><rect x="15.7139" y="20" width="6.28571" height="6" rx="1" fill="#92E8B8"/><path d="M16.32 1H5.68C4.69028 1.00023 3.73579 1.36738 3.00103 2.03046C2.26628 2.69355 1.80345 3.60549 1.702 4.59C1.696 4.642 1.692 4.691 1.685 4.742C1.604 5.416 1 10.456 1 12C1 12.7956 1.31607 13.5587 1.87868 14.1213C2.44129 14.6839 3.20435 15 4 15C5 15 5.5 14.5 6 14L7.414 12.586C7.78899 12.2109 8.29761 12.0001 8.828 12H13.172C13.7024 12.0001 14.211 12.2109 14.586 12.586L16 14C16.5 14.5 17 15 18 15C18.7956 15 19.5587 14.6839 20.1213 14.1213C20.6839 13.5587 21 12.7956 21 12C21 10.455 20.396 5.416 20.315 4.742C20.308 4.692 20.304 4.642 20.298 4.591C20.1968 3.60631 19.7341 2.69413 18.9993 2.03083C18.2645 1.36754 17.3099 1.00026 16.32 1Z" fill="#92E8B9" fill-opacity="0.31" stroke="#92E8B9" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path d="M5 7H9" stroke="#92E8B9" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path d="M7 5V9" stroke="#92E8B9" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path d="M14 8H14.01" stroke="#92E8B9" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path d="M17 6H17.01" stroke="#92E8B9" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
      // mouse / kb / touch (cherry)
      `<svg width="100%" height="100%" viewBox="0 0 22 26" fill="none" xmlns="http://www.w3.org/2000/svg"><rect y="22" width="22" height="4" rx="1" fill="#E89292"/><path d="M3 1L10.07 18L12.58 10.61L20 8.07L3 1Z" fill="#E89292" fill-opacity="0.48" stroke="#E89292" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
      // tv remote (lime)
      `<svg width="100%" height="100%" viewBox="0 0 33 38" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="6" y="34" width="22" height="4" rx="1" fill="#92E8B8"/><circle cx="14.9172" cy="15.3232" r="1.86944" transform="rotate(-45 14.9172 15.3232)" fill="#92E8B8"/><path fill-rule="evenodd" clip-rule="evenodd" d="M6.17163 13.2893C5.38541 14.0755 5.3854 15.3502 6.17163 16.1365L20.8142 30.779C21.6004 31.5652 22.8751 31.5652 23.6613 30.779L30.7792 23.6611C31.5655 22.8749 31.5655 21.6002 30.7792 20.814L16.1367 6.17141C15.3505 5.38519 14.0758 5.38518 13.2895 6.17141L6.17163 13.2893ZM17.8654 18.2724C19.494 16.6438 19.494 14.0034 17.8654 12.3748C16.2368 10.7462 13.5963 10.7462 11.9677 12.3748C10.3391 14.0034 10.3391 16.6438 11.9677 18.2724C13.5963 19.9011 16.2368 19.9011 17.8654 18.2724ZM19.697 23.3566C20.2024 22.8512 20.2024 22.0317 19.697 21.5263C19.1915 21.0209 18.3721 21.0209 17.8666 21.5263C17.3612 22.0317 17.3612 22.8512 17.8667 23.3566C18.3721 23.862 19.1915 23.862 19.697 23.3566ZM22.5436 24.373C23.0491 24.8784 23.0491 25.6979 22.5436 26.2033C22.0382 26.7087 21.2188 26.7087 20.7133 26.2033C20.2079 25.6979 20.2079 24.8784 20.7133 24.373C21.2188 23.8675 22.0382 23.8675 22.5436 24.373ZM23.1533 19.8995C23.6587 19.394 23.6587 18.5746 23.1533 18.0692C22.6479 17.5637 21.8284 17.5637 21.323 18.0692C20.8175 18.5746 20.8175 19.394 21.323 19.8995C21.8284 20.4049 22.6479 20.4049 23.1533 19.8995ZM26.0008 20.9166C26.5062 21.4221 26.5062 22.2415 26.0008 22.747C25.4954 23.2524 24.6759 23.2524 24.1705 22.747C23.665 22.2415 23.665 21.4221 24.1705 20.9166C24.6759 20.4112 25.4954 20.4112 26.0008 20.9166Z" fill="#92E8B8"/><path d="M3.12246 10.2382C2.60802 6.22554 6.02435 2.80921 10.037 3.32365M6.17299 10.4416C5.46388 7.95966 7.75847 5.66507 10.2404 6.37418" stroke="#92E8B8" stroke-width="1.15043" stroke-linecap="round"/></svg>`,
    ];

    function updateController(type) {
      controller.html(controllerTypes[type]);
    }

    document.addEventListener("CherryTree.Ui.ControllerChange", (e) => {
      updateController(e.detail);
    });

    // This is what handles TV remote.
    // PeerJS is used in here because it's the most convenient spot

    let peer = null;

    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

    const inputs = [
      "left",
      "right",
      "up",
      "down",
      "confirm",
      "back",
      "act",
      "alt",
      "menu",
      // special
      "volumeDown",
      "volumeUp",
      "playMedia",
      "pauseMedia",
    ];

    window.remoteState = false;

    function connectPeerJs() {
      let str = "";
      for (let i = 0; i < 4; i++) {
        str += chars[Math.floor(Math.random() * chars.length)];
      }

      window.phoneLinkCode = str;
      peer = new Peer("cherry-tree-tv-link-" + str);

      code.text("...");

      peer.on("open", () => {
        code.text(str);
      });

      peer.on("connection", (conn) => {
        Root.Libs.Notify.show(
          "Remote Connected",
          `A remote control has connected.`
        );
        code.text("");
        window.remoteState = true;

        document.addEventListener(
          "CherryTree.Input.ShowKeyboardPrompt",
          (e) => {
            console.log(e.detail);

            conn.send({
              type: "showKeyboard",
              detail: e.detail,
            });
          }
        );

        document.addEventListener("CherryTree.Ui.ChangeBackground", (e) => {
          console.log(e.detail);
          conn.send({
            type: "changeWallpaper",
            detail: e.detail,
          });
        });

        conn.on("data", (data) => {
          try {
            if (data.input) {
              if (typeof data.input !== "string") return;
              if (!inputs.includes(data.input)) {
                if (data.input === "volDown") {
                  document.dispatchEvent(
                    new CustomEvent("CherryTree.Input.VolumeDown")
                  );
                } else if (data.input === "volUp") {
                  document.dispatchEvent(
                    new CustomEvent("CherryTree.Input.VolumeUp")
                  );
                }
                return;
              }
              window.Libs.Input.pop(data.input, 5);
            }
            if (data.textInput !== undefined) {
              if (typeof data.textInput !== "string") return;
              // if (!inputs.includes(data.input)) return;
              // window.Libs.Input.pop(data.input, 5);
              document.dispatchEvent(
                new CustomEvent("CherryTree.Input.TypeInKeyboard", {
                  detail: {
                    text: data.textInput,
                  },
                })
              );
              if (data.finish !== undefined) {
                if (data.finish === true) {
                  document.dispatchEvent(
                    new CustomEvent("CherryTree.Input.FinishKeyboard", {
                      detail: {
                        text: data.textInput,
                      },
                    })
                  );
                }
              }
            }
          } catch (_) {}
        });
        conn.on('disconnect', () => {
          window.remoteState = false;
        })
      });
    }

    function disconnectPeerJs() {
      // PEER DESTRUCTION
      peer.destroy();
      code.text("");
    }

    async function enablePhoneLink() {
      localforage.setItem("settings__phoneLink", true);
      await connectPeerJs();
    }
    function disablePhoneLink() {
      localforage.setItem("settings__phoneLink", false);
      disconnectPeerJs();
    }

    if ((await localforage.getItem("settings__phoneLink")) === true) {
      enablePhoneLink();
    }

    document.addEventListener("CherryTree.Input.EnableTvRemote", (e) => {
      enablePhoneLink();
    });

    document.addEventListener("CherryTree.Input.DisableTvRemote", (e) => {
      disablePhoneLink();
    });
  },
  end: async function () {
    console.log("Bye!");
  },
};

export default pkg;
