import Html from "/libs/html.js";
import Ws from "/libs/windowSystem.js";
import Keyboard from "/libs/keyboard.js";
import settingsLib from "../../libs/settingsLib.js";
import langManager from "../../libs/l10n/manager.js";

let wrapper, Ui, Pid, Sfx;

const pkg = {
  name: "Settings",
  type: "app",
  privs: 0,
  start: async function (Root) {
    Pid = Root.Pid;

    Ui = Root.Processes.getService("UiLib").data;
    let Users = Root.Processes.getService("UserSvc").data;

    wrapper = new Html("div").class("ui", "pad-top", "gap").appendTo("body");

    Ui.transition("popIn", wrapper);

    Ui.becomeTopUi(Root.Pid, wrapper);

    Sfx = Root.Processes.getService("SfxLib").data;

    const Background = Root.Processes.getService("Background").data;
    console.log(Sfx);

    new Html("h1").text("Settings").appendTo(wrapper);
    new Html("p").text("Modify and change settings.").appendTo(wrapper);

    new Html("h2").text("Setup").appendTo(wrapper);
    new Html("p")
      .text("Configure account settings and setup.")
      .appendTo(wrapper);
    const row0 = new Html("div").class("flex-list").appendTo(wrapper);

    row0.appendMany(
      new Html("button")
        .text("Retrieve User Information")
        .on("click", async (e) => {
          await Ui.giveUpUi(Root.Pid, true);

          await Root.Libs.Modal.showWithoutButtons(
            "Loading",
            "Downloading user data...",
            wrapper,
            Root.Pid,
            async function (a) {
              let info = await Users.getUserInfo(
                await Root.Security.getToken()
              );
              a();
              setTimeout(() => {
                Root.Libs.Modal.Show({
                  parent: wrapper,
                  pid: Root.Pid,
                  title: "User Info",
                  description: JSON.stringify(info, null, 4),
                  buttons: [
                    {
                      type: "primary",
                      text: "OK",
                    },
                  ],
                });
              }, 500);
            }
          );
        }),
      new Html("button")
        .text("Log out of your account")
        .on("click", async (e) => {
          // Delegate UI while loading the app
          let result = await Root.Libs.Modal.Show({
            parent: wrapper,
            pid: Root.Pid,
            title: "Are you sure you want to log out?",
            description: "You will have to log in again.",
            buttons: [
              {
                type: "primary",
                text: "No",
              },
              {
                type: "negative",
                text: "Yes",
              },
            ],
          });

          // Delegate UI while loading the app
          // Ui.transition("popOut", wrapper, 500, true);
          // await Root.Libs.startPkg("system:Oobe", [], true);
        }),
      new Html("button").text("Delete ALL Data").on("click", async (e) => {
        // Delegate UI while loading the app
        let result = await Root.Libs.Modal.Show({
          parent: wrapper,
          pid: Root.Pid,
          title: "Are you sure you want to do this?",
          description:
            "This will delete EVERYTHING. Your saved user account data and settings will be deleted permanently.",
          buttons: [
            {
              type: "primary",
              text: "No",
            },
            {
              type: "negative",
              text: "Yes",
            },
          ],
        });

        if (result.id === 1) {
          await window.localforage.setItem("fs", null);
          location.reload();
        }
      })
    );

    new Html("h2").text("Input").appendTo(wrapper);
    new Html("p").text("Configure input methods.").appendTo(wrapper);

    let phoneLinkStatus = new Html("p")
      .html(`Phone Link code:&nbsp;`)
      .append(new Html("strong").text(window.phoneLinkCode))
      .appendTo(wrapper);

    let qr = new Html("img")
      .styleJs({
        borderRadius: "5px",
        width: "20%",
      })
      .appendTo(wrapper);

    function showTvLinkCode() {
      phoneLinkStatus.style({ display: "block" });
      qr.style({ display: "block" });

      phoneLinkStatus.elm.querySelector("strong").textContent =
        window.phoneLinkCode;

      fetch("http://localhost:9864/local_ip")
        .then((res) => res.text())
        .then((ip) => {
          qr.attr({
            src: `${location.protocol}//${location.hostname}:9864/qr?url=${location.protocol}//${ip}:${location.port}/link/index.html?code=${window.phoneLinkCode}`,
          });
        });
    }
    function hideTvLinkCode() {
      phoneLinkStatus.style({ display: "none" });
      qr.style({ display: "none" });
    }

    // events
    document.addEventListener("CherryTree.Input.EnableTvRemote", () => {
      showTvLinkCode();
    });
    document.addEventListener("CherryTree.Input.DisableTvRemote", () => {
      hideTvLinkCode();
    });

    if ((await window.localforage.getItem("settings__phoneLink")) === true) {
      showTvLinkCode();
    } else {
      hideTvLinkCode();
    }

    const row1 = new Html("div").class("flex-list").appendTo(wrapper);

    row1.appendMany(
      new Html("button")
        .text("Enable/Disable Phone Link")
        .on("click", () => settingsLib.togglePhoneLink(Root.Pid, wrapper))
    );

    new Html("h2")
      .text(langManager.getString("settings.categories.display.title"))
      .appendTo(wrapper);
    new Html("p")
      .text(langManager.getString("settings.categories.display.description"))
      .appendTo(wrapper);
    const row2 = new Html("div").class("flex-list").appendTo(wrapper);

    row2.appendMany(
      new Html("button")
        .text(
          langManager.getString("settings.categories.display.items.uiScaling")
        )
        .on("click", () => settingsLib.uiScaling(Root.Pid, wrapper, Ui)),
      new Html("button")
        .text(
          langManager.getString("settings.categories.display.items.background")
        )
        .on("click", () =>
          settingsLib.background(Root.Pid, wrapper, Background)
        )
    );

    new Html("h2")
      .text(langManager.getString("settings.categories.audio.title"))
      .appendTo(wrapper);
    new Html("p")
      .text(langManager.getString("settings.categories.audio.description"))
      .appendTo(wrapper);
    const row3 = new Html("div").class("flex-list").appendTo(wrapper);

    row3.appendMany(
      new Html("button")
        .text(langManager.getString("settings.categories.audio.items.volume"))
        .on("click", () => settingsLib.changeVolume(Root.Pid, wrapper, Sfx)),
      new Html("button")
        .text(langManager.getString("settings.categories.audio.items.sfx"))
        .on("click", () => settingsLib.sfx(Root.Pid, wrapper, Sfx)),
      new Html("button")
        .text(langManager.getString("settings.categories.audio.items.bgm"))
        .on("click", () => settingsLib.bgm(Root.Pid, wrapper, Sfx))
    );

    new Html("h2").text("Picture calibration").appendTo(wrapper);
    const row4 = new Html("div").class("flex-list").appendTo(wrapper);
    const row5 = new Html("div").class("flex-list").appendTo(wrapper);

    row4.appendMany(
      new Html("button").text("Open test pattern").on("click", async () => {
        await Root.Libs.startPkg(
          "apps:VideoPlayer",
          [
            {
              app: "video",
              videoPath: "../../assets/video/color_bars.mp4",
              displayName: "SMPTE test pattern",
              isOnline: true,
              autoplay: false,
            },
          ],
          true
        );
      })
    );

    row5.appendMany(
      new Html("button").text("Quit Settings").on("click", async (e) => {
        await Root.end();
      })
    );

    Ui.init(
      Root.Pid,
      "horizontal",
      [
        row0.elm.children,
        row1.elm.children,
        row2.elm.children,
        row3.elm.children,
        row4.elm.children,
        row5.elm.children,
      ],
      function (e) {
        if (e === "back") {
          Root.end();
        }
      }
    );
  },
  end: async function () {
    // Exit this UI when the process is exited
    Ui.cleanup(Pid);
    Sfx.playSfx("deck_ui_out_of_game_detail.wav");
    // await Ui.transition("popOut", wrapper);
    Ui.giveUpUi(Pid);
    wrapper.cleanup();
  },
};

export default pkg;
