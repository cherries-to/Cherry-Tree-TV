import Html from "/libs/html.js";
import CustomInput from "../../libs/customInput.js";

let wrapper, Ui, Pid, Sfx, controller;
let endFunc;

const pkg = {
  name: "Custom Controller",
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

    controller = new CustomInput({
      wrapperStyles: {
        display: "flex",
        flexDirection: "column",
      },
      elements: {
        button1: {
          type: "button",
          text: "Button 1",
          style: {
            flexGrow: "1",
          },
          events: {
            click: "CustomInpClick",
          },
        },
        button2: {
          type: "button",
          text: "Button 2",
          style: {
            flexGrow: "1",
          },
          events: {
            click: "CustomInpClick",
          },
        },
        button3: {
          type: "button",
          text: "Button 3",
          style: {
            flexGrow: "1",
          },
          events: {
            click: "CustomInpClick",
          },
        },
        button4: {
          type: "button",
          text: "Button 4",
          style: {
            flexGrow: "1",
          },
          events: {
            click: "CustomInpClick",
          },
        },
      },
    });

    endFunc = () => {
      pkg.end();
    };

    controller.register();
    document.addEventListener("CustomInpClick", endFunc);

    new Html("h1").text("Custom Controller Demo").appendTo(wrapper);
    new Html("p")
      .text("Click on any button to exit this app.")
      .appendTo(wrapper);
    // const row = new Html("div")
    //   .class("flex-list")
    //   .appendMany(
    //     new Html("button").on("click", (e) => {
    //       Root.end();
    //     }),
    //   )
    //   .appendTo(wrapper);

    Ui.init(Pid, "horizontal", [], function (e) {
      if (e === "back") {
        pkg.end();
      }
    });
  },
  end: async function () {
    document.removeEventListener("CustomInpClick", endFunc);
    controller.destroy();
    // Exit this UI when the process is exited
    Ui.cleanup(Pid);
    Sfx.playSfx("deck_ui_out_of_game_detail.wav");
    // await Ui.transition("popOut", wrapper);
    Ui.giveUpUi(Pid);
    wrapper.cleanup();
  },
};

export default pkg;
