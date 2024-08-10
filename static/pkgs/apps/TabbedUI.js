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
    let tabContentButtons = [];

    let uiFuncs = {
      add: (elm) => {
        tabContentButtons.push(elm);
        console.log("Added to list", tabContentButtons);
      },
    };

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
        tabContentButtons = [];
        tabs[tab](tabContents, uiFuncs);
      });
      tabElement.text(tab);
      tabElement.appendTo(tabDiv);
      tabButtons.push(tabDiv.elm.children);
    });

    console.log(Sfx);
    let focusedOnTab = false;
    let prevValue = 0;

    function handleTabFocus(e) {
      console.log(e);
      console.log(prevValue);
      if (
        focusedOnTab == false &&
        e.x === 0 &&
        prevValue == 0 &&
        e.button == "right"
      ) {
        Ui.init(Pid, "horizontal", tabContentButtons, handleTabFocus);
        focusedOnTab = true;
      } else if (
        focusedOnTab == true &&
        e.x === 0 &&
        prevValue == 0 &&
        e.button == "left"
      ) {
        Ui.init(Pid, "horizontal", tabButtons, handleTabFocus);
        focusedOnTab = false;
      }
      prevValue = e.x;
    }

    Ui.init(Pid, "horizontal", tabButtons, handleTabFocus);
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
