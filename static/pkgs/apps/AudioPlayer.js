import icons from "../../libs/icons.js";
import Html from "/libs/html.js";
import ColorThief from "../../libs/color-thief.mjs";

let wrapper, Ui, Pid, Sfx, colorThief;

const pkg = {
  name: "Audio Player",
  type: "app",
  privs: 0,
  start: async function (Root) {
    Pid = Root.Pid;

    Ui = Root.Processes.getService("UiLib").data;

    wrapper = new Html("div").class("full-ui").appendTo("body");

    Ui.transition("popIn", wrapper);

    Ui.becomeTopUi(Pid, wrapper);

    Sfx = Root.Processes.getService("SfxLib").data;

    const Background = Root.Processes.getService("Background").data;
    colorThief = new ColorThief();

    console.log(Sfx);

    let container = new Html("div")
      .styleJs({
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: "20px",
      })
      .appendTo(wrapper);

    let songDisplay = new Html("div")
      .styleJs({
        display: "flex",
        gap: "20px",
        alignItems: "center",
        justifyContent: "center",
      })
      .appendTo(container);
    let albumCover = new Html("img")
      .attr({
        src: "assets/img/maxresdefault.png",
      })
      .styleJs({
        width: "15rem",
        height: "15rem",
        aspectRatio: "1 / 1",
        objectFit: "cover",
        borderRadius: "8px",
        boxShadow: `2.8px 2.8px 2.2px rgba(0, 0, 0, 0.02),
  6.7px 6.7px 5.3px rgba(0, 0, 0, 0.028),
  12.5px 12.5px 10px rgba(0, 0, 0, 0.035),
  22.3px 22.3px 17.9px rgba(0, 0, 0, 0.042),
  41.8px 41.8px 33.4px rgba(0, 0, 0, 0.05),
  100px 100px 80px rgba(0, 0, 0, 0.07)`,
      })
      .appendTo(songDisplay);

    let songInfo = new Html("div")
      .styleJs({ display: "flex", flexDirection: "column", gap: "10px" })
      .appendTo(songDisplay);

    let songTitle = new Html("h1").text("Unknown song").appendTo(songInfo);
    let songArtist = new Html("p").text("Unknown artist").appendTo(songInfo);

    function createButton(content, callback) {
      return new Html("button").html(content).on("click", callback).styleJs({
        minWidth: "3.25rem",
        height: "3.25rem",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "0.8rem",
      });
    }

    let playerControls = new Html("div")
      .styleJs({
        display: "flex",
        gap: "15px",
        alignItems: "center",
        justifyContent: "center",
        padding: "1rem",
        borderRadius: "5px",
        background: "rgba(0,0,0,0.5)",
      })
      .appendTo(container);
    let skipBack = createButton(icons["stepBack"], function () {
      alert("Back");
    }).appendTo(playerControls);
    let playButton = createButton(icons["play"], function () {
      alert("Play");
    }).appendTo(playerControls);
    let skipForward = createButton(icons["stepForward"], function () {
      alert("Back");
    }).appendTo(playerControls);

    // wip

    function setAccentedBackground() {
      let color = colorThief.getColor(albumCover.elm);
      console.log("colors", color);
      container.styleJs({
        backgroundColor: `rgb(${color[0] - 10},${color[1] - 10}, ${
          color[2] - 10
        })`,
      });
    }

    if (albumCover.elm.complete) {
      setAccentedBackground();
    } else {
      albumCover.elm.addEventListener("load", setAccentedBackground);
    }

    Ui.init(Pid, "horizontal", [playerControls.elm.children], function (e) {
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
