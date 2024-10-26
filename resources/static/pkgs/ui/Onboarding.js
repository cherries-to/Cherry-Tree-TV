import Html from "/libs/html.js";

let wrapper, Ui, Pid, Sfx;

const pkg = {
  name: "Onboarding",
  type: "app",
  privs: 0,
  start: async function (Root) {
    Pid = Root.Pid;

    Ui = Root.Processes.getService("UiLib").data;

    wrapper = new Html("div")
      .class("full-ui", "flex-col")
      .styleJs({
        alignItems: "center",
        justifyContent: "center",
      })
      .appendTo("body");

    let innerContainer = new Html("div")
      .styleJs({
        display: "flex",
        width: "50%",
        height: "30%",
      })
      .appendTo(wrapper);

    let leftContainer = new Html("div")
      .styleJs({
        display: "flex",
        flexDirection: "column",
        width: "50%",
        justifyContent: "center",
        alignItems: "flex-start",
        gap: "10px",
      })
      .appendTo(innerContainer);

    let rightContainer = new Html("div")
      .styleJs({
        display: "flex",
        flexDirection: "column",
        width: "50%",
        justifyContent: "center",
        alignItems: "flex-end",
        gap: "10px",
      })
      .appendTo(innerContainer);

    Ui.transition("popIn", wrapper);

    Ui.becomeTopUi(Pid, wrapper);

    Sfx = Root.Processes.getService("SfxLib").data;

    Sfx.playSfx("deck_ui_into_game_detail.wav");

    const Background = Root.Processes.getService("Background").data;

    console.log(Sfx);

    let ip;

    try {
      let a = await fetch("http://localhost:9864/local_ip").then((t) =>
        t.text(),
      );
      ip = a;
    } catch (e) {
      ip = "127.0.0.1";
    }

    new Html("h1")
      .text("Connect a controller to continue")
      .appendTo(leftContainer);
    new Html("p")
      .text(
        "Connect a controller, keyboard, or remote. \n Press OK to continue.",
      )
      .appendTo(leftContainer);
    new Html("br").appendTo(leftContainer);
    const row = new Html("div")
      .appendMany(
        new Html("button").text("OK").on("click", async (e) => {
          Sfx.playSfx("deck_ui_into_game_detail.wav");
          Ui.transition("popOut", wrapper, 500, true);
          await Root.Libs.startPkg("ui:MainMenu", []);
        }),
      )
      .appendTo(leftContainer);

    if ((await window.localforage.getItem("settings__phoneLink")) === true) {
      new Html("img")
        .attr({
          src: `http://127.0.0.1:9864/qr?url=${location.protocol}//${ip}:${location.port}/link/index.html?code=${window.phoneLinkCode}`,

          // src: `${location.protocol}//${location.hostname}:9864/qr?url=${location.protocol}//${ip}:${location.port}/link/index.html?code=${window.phoneLinkCode}`,
        })
        .styleJs({
          borderRadius: "0.5rem",
          width: "16rem",
          height: "16rem",
          imageRendering: "pixelated",
        })
        .appendTo(rightContainer);
    } else {
      leftContainer.styleJs({
        width: "100%",
        alignItems: "center",
        textAlign: "center",
      });
      rightContainer.cleanup();
    }

    Ui.init(Pid, "horizontal", [row.elm.children]);
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
