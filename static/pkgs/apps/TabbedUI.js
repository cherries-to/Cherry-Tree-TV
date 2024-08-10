import Html from "/libs/html.js";

let wrapper, Ui, Pid, Sfx;

const pkg = {
  name: "TabbedUI",
  type: "app",
  privs: 0,
  start: async function (Root) {
    Pid = Root.Pid;

    Ui = Root.Processes.getService("UiLib").data;

    wrapper = new Html("div").class("ui", "pad-top", "gap").appendTo("body");

    Ui.transition("popIn", wrapper);

    Ui.becomeTopUi(Pid, wrapper);

    Sfx = Root.Processes.getService("SfxLib").data;

    Sfx.playSfx("deck_ui_into_game_detail.wav");

    const Background = Root.Processes.getService("Background").data;

    console.log(Sfx);

    new Html("h1").text("Controller Remapping").appendTo(wrapper);
    new Html("p")
      .text(
        "Select a controller to remap.\nNote: Controller inputs are ignored, use keyboard, mouse, or touch to control this menu."
      )
      .appendTo(wrapper);
    const row = new Html("div")
      .class("flex-list")
      .appendMany(
        new Html("button").on("click", (e) => {
          Root.end();
        })
      )
      .appendTo(wrapper);

    Ui.init(Pid, "horizontal", [row.elm.children], function (e) {
      console.log(e);
      if (e === "back") {
        pkg.end();
      }
    });
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
