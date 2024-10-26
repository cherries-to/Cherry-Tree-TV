import Html from "/libs/html.js";
import Ws from "/libs/windowSystem.js";
import Keyboard from "/libs/keyboard.js";
import settingsLib from "../../libs/settingsLib.js";
import langManager from "../../libs/l10n/manager.js";

let wrapper, Ui, Pid, Sfx;

const pkg = {
  name: "Screen Saver",
  type: "app",
  privs: 0,
  start: async function (Root) {
    Pid = Root.Pid;

    Ui = Root.Processes.getService("UiLib").data;
    let Users = Root.Processes.getService("UserSvc").data;

    wrapper = new Html("div").class("ui", "pad-top", "gap").appendTo("body");
    wrapper.style({
      "z-index": 2147483646,
    });

    Ui.transition("popIn", wrapper);

    Ui.becomeTopUi(Root.Pid, wrapper);

    Sfx = Root.Processes.getService("SfxLib").data;

    const Background = Root.Processes.getService("Background").data;
    console.log(Sfx);

    let time = new Html("h1").text("").appendTo(wrapper);
    time.style({
      position: "fixed",
      top: 0,
      left: 0,
      color: "white",
      "font-size": "3em",
      padding: "10px",
      margin: "1.5em",
      "z-index": 2147483647,
      color: "white",
      "text-shadow": "0px 0px 30px #000000",
      opacity: "0",
      transition: "all 0.2s linear",
    });
    setInterval(() => {
      time.text(new Date().toLocaleTimeString());
    }, 1000);

    setTimeout(() => {
      time.styleJs({ opacity: "1" });
    }, 1000);

    let bg = new Html("img").appendTo(wrapper);
    bg.style({
      position: "fixed",
      top: 0,
      left: 0,
      width: "100%",
      height: "100%",
      opacity: "0",
      objectFit: "cover",
      transition: "all 0.2s linear",
    });
    bg.elm.src = `https://picsum.photos/${window.innerWidth}/${
      window.innerHeight
    }?t=${Math.random()}`;
    setInterval(() => {
      console.log(bg);
      bg.styleJs({ opacity: "0" });
      bg.elm.src = `https://picsum.photos/${window.innerWidth}/${
        window.innerHeight
      }?t=${Math.random()}`;
    }, 20000);
    bg.elm.addEventListener("load", () => {
      setTimeout(() => {
        bg.styleJs({ opacity: "1" });
      }, 200);
    });
    const row0 = new Html("div").class("flex-list").appendTo(wrapper);

    row0.appendMany();
    // events

    Ui.init(Root.Pid, "horizontal", [row0.elm.children], function (e) {
      //   if (e === "back") {
      //     Root.end();
      //   }
      if (e) {
        Root.end();
      }
    });
  },
  end: async function () {
    document.dispatchEvent(new CustomEvent("CherryTree.Ui.ExitApp"));
    // Exit this UI when the process is exited
    Ui.cleanup(Pid);
    Sfx.playSfx("deck_ui_out_of_game_detail.wav");
    // await Ui.transition("popOut", wrapper);
    Ui.giveUpUi(Pid);
    wrapper.cleanup();
  },
};

export default pkg;
