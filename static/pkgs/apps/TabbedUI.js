import Html from "/libs/html.js";

let wrapper, Ui, Pid, Sfx;

const pkg = {
  name: "TabbedUI",
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
      "Tab 1": (wrapper) => {
        new Html("h1").text("Hi, I'm Tab 1!").appendTo(wrapper);
      },
      "Tab 2": (wrapper) => {
        new Html("h1").text("Hi, I'm Tab 2!").appendTo(wrapper);
      },
    };

    let tabsList = new Html("div")
      .styleJs({
        height: "75%",
        width: "15%",
        display: "flex",
        flexDirection: "column",
        backgroundColor: "var(--background-light)",
        borderRadius: "5px",
      })
      .appendTo(wrapper);

    let tabContents = new Html("div")
      .styleJs({
        height: "75%",
        width: "75%",
        display: "flex",
        flexDirection: "column",
        backgroundColor: "var(--background-light)",
        borderRadius: "5px",
      })
      .appendTo(wrapper);

    let tabButtons = [];

    Object.keys(tabs).forEach((tab) => {
      let tabDiv = new Html("div").appendTo(tabsList).styleJs({
        width: "100%",
        height: "10%",
      });
      let tabElement = new Html("button").styleJs({
        width: "100%",
        height: "100%",
        textAlign: "left",
      });
      tabElement.on("click", () => {
        tabContents.clear();
        tabs[tab](tabContents);
      });
      tabElement.text(tab);
      tabElement.appendTo(tabDiv);
      tabButtons.push(tabDiv.elm.children);
    });

    console.log(Sfx);

    Ui.init(Pid, "horizontal", tabButtons, function (e) {
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
