import icons from "../../libs/icons.js";
import Html from "/libs/html.js";

let Ui, Pid, Sfx, volumeUpdate;
let uiElements;

const pkg = {
  name: "YouTube",
  type: "app",
  privs: 0,
  // Root and audio, commonly used so we store it in here
  // reduces arguments to functions
  Root: undefined,
  audio: undefined,

  // ui elements
  topBar: undefined,
  actionRow: undefined,
  searchRow: undefined,
  settingsUi: undefined,
  wrapper: undefined,
  outerWrapper: undefined,

  socket: null,
  intervalFunction: null,
  volume: { level: 100, muted: false },
  playerFrame: null,

  updateUi: async function (extraElements, buttonHandler) {
    Sfx.playSfx("deck_ui_tab_transition_01.wav");
    if (
      Ui.update(this.Root.Pid, [this.topBar.elm.children, ...extraElements]) !==
      false
    ) {
      Ui.updateParentCallback(this.Root.Pid, buttonHandler);
    } else {
      Ui.init(
        this.Root.Pid,
        "horizontal",
        [this.topBar.elm.children, ...extraElements],
        buttonHandler
      );
    }
  },

  createRow: async function (appendTo) {
    return new Html("div")
      .class("flex-list")
      .styleJs({
        overflow: "auto",
        // "align-items": "flex-end",
        width: "100%",
        // "min-height": "300px",
      })
      .appendTo(appendTo);
  },

  createUi: async function (appendTo) {
    return new Html("div")
      .styleJs({
        overflow: "auto",
        // "align-items": "flex-end",
        width: "100%",
        // "min-height": "300px",
      })
      .appendTo(appendTo);
  },

  play: async function (id) {
    await this.wrapper.clear();

    let bottom,
      playPause,
      timeElapsed,
      timeElapsedFront,
      timeElapsedMiddle,
      timeElapsedBack,
      progressBarValue,
      progress;
    // i put these functions in here because they relate wayy more to the play function itself than to anything else
    let createBottomBar = () => {
      bottom = new Html("div")
        .class("flex-list")
        .appendTo(this.wrapper)
        .styleJs({
          position: "absolute",
          bottom: "1rem",
          zIndex: "100000000",
          width: "calc(100% - 2rem)",
          opacity: "1",
          left: "1rem",
          backgroundColor: "rgba(0, 0, 0, 0.5)",
          transition: "0.1s linear",
          padding: "1rem",
          borderRadius: "8px",
          opacity: "0",
        });
      return bottom;
    };

    function createControlButtons(bottom) {
      new Html("button")
        .html(icons["stepBack"])
        .appendTo(bottom)
        .on("click", () => {
          console.log("click");
          let currentVideoTime = videoElm.elm.currentTime
            ? videoElm.elm.currentTime
            : 0;
          let newTime = currentVideoTime - 10;
          if (newTime < 0) {
            newTime = 0;
          }
          videoElm.elm.currentTime = newTime;
        })
        .styleJs({
          minWidth: "3.25rem",
          height: "3.25rem",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "0.8rem",
        });

      playPause = new Html("button")
        .html(icons["play"])
        .appendTo(bottom)
        .on("click", () => {
          console.log("click");
          let paused = videoElm.elm.paused || videoElm.elm.ended;
          console.log(paused);
          if (paused) {
            videoElm.elm.play();
          } else {
            videoElm.elm.pause();
          }
        })
        .styleJs({
          minWidth: "3.25rem",
          height: "3.25rem",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "0.8rem",
        });

      new Html("button")
        .html(icons["stepForward"])
        .appendTo(bottom)
        .on("click", () => {
          console.log("click");
          let currentVideoTime = videoElm.elm.currentTime
            ? videoElm.elm.currentTime
            : 0;
          let newTime = currentVideoTime + 10;
          if (newTime > videoElm.elm.duration) {
            newTime = videoElm.elm.duration;
          }
          videoElm.elm.currentTime = newTime;
        })
        .styleJs({
          minWidth: "3.25rem",
          height: "3.25rem",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "0.8rem",
        });
      return playPause;
    }

    function createTimeElapsed(bottom) {
      timeElapsed = new Html("p").appendTo(bottom).styleJs({
        flexShrink: "0",
        display: "flex",
        "align-items": "center",
        gap: "8px",
      });
      timeElapsedFront = new Html("span").styleJs({ fontSize: "1.3rem" });
      timeElapsedMiddle = new Html("span")
        .styleJs({ opacity: 0.7, fontSize: "1.8rem" })
        .text("/");
      timeElapsedBack = new Html("span").styleJs({ fontSize: "1.3rem" });
      timeElapsed.appendMany(
        timeElapsedFront,
        timeElapsedMiddle,
        timeElapsedBack
      );
      return timeElapsed;
    }

    function createProgressSlider(bottom) {
      progress = new Html("div")
        .class("vp-progress-bar")
        .style({
          "flex-grow": "1",
        })
        .appendTo(bottom);
      progressBarValue = new Html("div")
        .class("vp-progress-bar-value")
        .appendTo(progress);
      return progress;
    }

    bottom = createBottomBar();
    createControlButtons(bottom);
    createTimeElapsed(bottom);
    createProgressSlider(bottom);

    // temporary player
    const audio = Sfx.getAudio();

    if (this.intervalFunction) {
      clearInterval(this.intervalFunction);
      this.intervalFunction = null;
    }

    if (this.playerFrame) {
      this.playerFrame.destroy();
      this.playerFrame = null;
    }
    this.socket.off("resume");
    this.socket.off("pause");
    this.socket.off("seek");
    this.socket.off("volume");

    audio.pause();

    Ui.transition("popOut", this.wrapper);

    let player = new Html("div")
      .id("player")
      .style({
        height: "100%",
        width: "100%",
      })
      .appendTo(this.wrapper);
    this.wrapper.class("full-ui");
    this.playerFrame = new window.YT.Player("player", {
      height: window.innerHeight,
      width: window.innerWidth,
      videoId: id,
      playerVars: {
        autoplay: 1,
        controls: 0,
      },
      events: {
        onReady: () => {
          console.log("player ready");
          Ui.transition("popIn", this.wrapper);
          this.playerFrame.setVolume(this.volume.level);
          volumeUpdate = (e) => {
            this.playerFrame.setVolume(e.detail);
            this.volume.level = e.detail;
          };
          document.addEventListener("CherryTree.Ui.VolumeChange", volumeUpdate);
          this.socket.emit("duration", this.playerFrame.getDuration());
          this.socket.on("resume", () => {
            this.playerFrame.playVideo();
          });
          this.socket.on("pause", () => {
            this.playerFrame.pauseVideo();
          });
          this.socket.on("seek", (pos) => {
            this.playerFrame.seekTo(pos);
          });
          this.socket.on("volume", (volume) => {
            this.playerFrame.setVolume(volume.level);
            this.volume.level = volume.level;
            document.dispatchEvent(
              new CustomEvent("CherryTree.Input.VolumeChange", {
                detail: this.volume.level,
              })
            );
          });
          this.intervalFunction = setInterval(() => {
            this.socket.emit("position", this.playerFrame.getCurrentTime());
          }, 500);
        },
        onStateChange: (e) => {
          console.log("state change", e);
          if (e.data == window.YT.PlayerState.ENDED) {
            console.log("The video has finished playing.");
            this.socket.emit("finishedPlaying");
          }
        },
      },
    });
  },

  createActionRow: async function () {
    let actionList = [
      {
        name: "Search",
        icon: icons.search,
        action: () => {
          this.searchAndQuery();
        },
      },
    ];

    actionList.forEach((a) => {
      let actionWrapper = new Html("button");
      actionWrapper.styleJs({
        background: "transparent",
        scrollSnapAlign: "center",
        objectFit: "contain",
        minWidth: "22rem",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
      });
      let img = new Html("div")
        .appendTo(actionWrapper)
        .append(
          new Html("span")
            .style({
              display: "inline-block",
              width: "4rem",
              height: "4rem",
            })
            .html(a.icon)
        )
        .styleJs({
          aspectRatio: "16 / 9",
          minWidth: "20rem",
          height: "11.50rem",
          borderRadius: "10px",
          backgroundColor: "#222",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        });
      let actionTitle = new Html("p").text(a.name).styleJs({
        width: "100%",
        textAlign: "left",
        padding: "10px",
      });
      actionTitle.appendTo(actionWrapper);
      actionWrapper.on("click", a.action);
      actionWrapper.appendTo(this.actionRow);
    });
  },

  searchAndQuery: async function () {
    await this.searchRow.clear();

    let options = {
      title: "Search",
      description: "Search YouTube.",
      parent: document.body,
      pid: this.Root.Pid,
      value: "",
      type: "text",
    };

    let result = (await this.Root.Libs.Modal.showKeyboard(options)).value;

    let ytQuery = await fetch(
      `https://olive.nxw.pw:8080/search?term=${result}`
    ).then((t) => t.json());
    ytQuery.items.forEach((i) => {
      console.log(i);
      let thumbnailWrapper = new Html("button");
      thumbnailWrapper.styleJs({
        background: "transparent",
        scrollSnapAlign: "center",
        objectFit: "contain",
        minWidth: "22rem",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
      });
      let img = new Html("img")
        .appendTo(thumbnailWrapper)
        .attr({ src: `https://i.ytimg.com/vi/${i.id}/maxresdefault.jpg` })
        .styleJs({
          aspectRatio: "16 / 9",
          minWidth: "20rem",
          height: "11.25rem",
          borderRadius: "10px",
        });
      let title = new Html("p").text(i.title).styleJs({
        width: "100%",
        textAlign: "left",
        padding: "10px",
      });
      title.appendTo(thumbnailWrapper);
      thumbnailWrapper.on("click", async () => {
        this.play(i.id);
      });
      thumbnailWrapper.appendTo(this.searchRow);
      this.updateUi(
        [this.actionRow.elm.children, this.searchRow.elm.children],
        (e) => {
          if (e === "back") {
            this.home();
          }
        }
      );
      Ui.transition("popIn", thumbnailWrapper);
    });
  },

  cast: async function () {
    // get the tvName so we can use it when casting
    const tvName = this.Root.Security.getSecureVariable("TV_NAME");

    this.socket = window.io({
      auth: {
        name: tvName,
        screenName: "YouTube on Cherry Tree",
        brand: "Cherries.to",
        model: "Cherry Tree",
      },
    });

    this.socket.on("success", () => {
      console.log("TV is now discoverable");
      this.Root.Libs.Notify.show(
        "This TV is now discoverable",
        `This TV is being discovered as "${tvName}"`
      );
    });

    this.socket.on("clientConnected", (sender) => {
      console.log(sender);
      this.Root.Libs.Notify.show(
        `${sender.user.name} connected to this TV.`,
        `${sender.user.name}'s ${sender.name} connected to this TV.`
      );
    });

    this.socket.on("clientDisconnected", (sender) => {
      console.log(sender);
      this.Root.Libs.Notify.show(
        `${sender.user.name} disconnected`,
        `${sender.user.name}'s ${sender.name} has been disconnected.`
      );
    });

    this.socket.on("play", (video) => {
      console.log("TV received play data", video);
      this.play(video.id);
    });

    this.socket.on("pause", () => {
      console.log("TV received pause data");
    });

    this.socket.on("resume", () => {
      console.log("TV received resume data");
    });

    this.socket.on("stop", () => {
      console.log("TV received stop data");
      this.wrapper.clear();
    });

    this.socket.on("seek", (pos) => {
      console.log("TV received seek data", pos);
    });

    this.socket.on("volume", (vol) => {
      console.log("TV received volume data", vol);
    });
  },

  loadScript: async function (url) {
    // script probably already exists
    if (Html.qs('script[src="' + url + '"]')) {
      return false;
    }

    return new Promise((resolve, reject) => {
      new Html("script")
        .attr({ src: url })
        .on("load", () => resolve(true))
        .appendTo("body");
    });
    return true;
  },

  home: async function () {
    this.wrapper.clear();

    this.actionRow = await this.createRow(this.wrapper);
    this.searchRow = await this.createRow(this.wrapper);

    await this.createActionRow();

    this.updateUi(
      [this.actionRow.elm.children, this.searchRow.elm.children],
      (e) => {
        if (e === "back") {
          pkg.end();
        }
      }
    );
  },

  settings: async function () {
    this.wrapper.clear();

    this.settingsUi = await this.createUi(this.wrapper);

    new Html("h1").text("Settings").appendTo(this.settingsUi);

    this.updateUi([], (e) => {
      if (e === "back") {
        this.home(); // change to last visited page potentially?
      }
    });
  },

  start: async function (Root) {
    // store the root and other root related functions
    this.Root = Root;
    Pid = Root.Pid;

    // get the ui library
    Ui = Root.Processes.getService("UiLib").data;

    // create the topbar and other row elements
    this.outerWrapper = new Html("div")
      .style({ "max-width": "100%" })
      .class("ui", "pad-top", "gap")
      .appendTo("body");

    this.topBar = await this.createRow(this.outerWrapper);
    this.topBar.elm.style.paddingLeft = "12px"; // add padding left as 12px to match the row

    this.wrapper = new Html("div").appendTo(this.outerWrapper);

    // pop in application and play sound effect
    Ui.transition("popIn", this.wrapper);
    Ui.becomeTopUi(Pid, this.wrapper);
    Sfx = Root.Processes.getService("SfxLib").data;
    // Sfx.playSfx("deck_ui_into_game_detail.wav");
    const Background = Root.Processes.getService("Background").data;

    // get the volume level and set it to this.volume.level
    const audio = Sfx.getAudio();
    this.audio = audio;
    this.volume.level = Sfx.getVolume() * 100; //? (not sure what this is supposed to do) -tuck

    this.cast();

    await this.loadScript("https://www.youtube.com/iframe_api");

    let topButtons = [
      {
        text: "Home",
        action: async () => {
          this.home();
        },
      },
      {
        text: "Settings",
        action: async () => {
          this.settings();
        },
      },
    ];

    topButtons.forEach((b) => {
      new Html("button")
        .text(b.text)
        .on("click", b.action)
        .appendTo(this.topBar);
    });

    await this.home();
  },
  end: async function () {
    // Exit this UI when the process is exited
    Ui.cleanup(Pid);
    Sfx.playSfx("deck_ui_out_of_game_detail.wav");
    // await Ui.transition("popOut", this.wrapper);
    this.socket.disconnect();
    document.removeEventListener("CherryTree.Ui.VolumeChange", volumeUpdate);
    Ui.giveUpUi(Pid);
    this.outerWrapper.cleanup();
  },
};

export default pkg;
