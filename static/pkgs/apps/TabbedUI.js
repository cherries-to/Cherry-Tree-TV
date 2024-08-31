import Html from "/libs/html.js";
import TabbedUI from "../../libs/tabbedUI.js";

let wrapper, Ui, Pid, Sfx;

const pkg = {
  name: "Tabbed UI Template",
  type: "app",
  privs: 0,
  start: async function (Root) {
    Pid = Root.Pid;

    Ui = Root.Processes.getService("UiLib").data;

    wrapper = new Html("div").class("full-ui").appendTo("body").styleJs({
      display: "flex",
      gap: "25px",
      alignItems: "center",
      justifyContent: "center",
      flexDirection: "row",
    });

    Ui.transition("popIn", wrapper);

    Ui.becomeTopUi(Pid, wrapper);

    Sfx = Root.Processes.getService("SfxLib").data;

    Sfx.playSfx("deck_ui_into_game_detail.wav");

    const Background = Root.Processes.getService("Background").data;

    let tabs = {
      "Tab 1": (wrapper, ui) => {
        new Html("h1").text("Hi, I'm Tab 1!").appendTo(wrapper);
        let curDiv = new Html("div").appendTo(wrapper);
        new Html("button")
          .text("click me!")
          .appendTo(curDiv)
          .on("click", () => {
            alert("i have been clicked!");
          });
        new Html("button")
          .text("do not click me!")
          .appendTo(curDiv)
          .on("click", () => {
            alert("your system is destroy :(");
          });
        ui.add(curDiv.elm.children);
      },
      "Tab 2": (wrapper, ui) => {
        new Html("h1").text("Hi, I'm Tab 2!").appendTo(wrapper);
        let curDiv = new Html("div").appendTo(wrapper);
        new Html("button")
          .text("did you know")
          .appendTo(curDiv)
          .on("click", () => {
            alert("that i cope using programming");
          });
        new Html("button")
          .text("did you also know")
          .appendTo(curDiv)
          .on("click", () => {
            alert("i listen to way too much synthion");
          });
        ui.add(curDiv.elm.children);
      },
    };

    this.tabbedUI = new TabbedUI({
      pid: Pid,
      tabs: tabs,
      wrapper: wrapper,
      sfx: Sfx,
      ui: Ui,
      callback: (e) => {
        if (e == "back") {
          pkg.end();
        }
      },
    });
  },
  end: async function () {
    // Exit this UI when the process is exited
    this.tabbedUi.cleanup();
    Ui.cleanup(Pid);
    Sfx.playSfx("deck_ui_out_of_game_detail.wav");
    // await Ui.transition("popOut", wrapper);
    Ui.giveUpUi(Pid);
    wrapper.cleanup();
  },
};

export default pkg;
