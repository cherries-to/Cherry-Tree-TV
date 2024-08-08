import icons from "../../libs/icons.js";
import Html from "/libs/html.js";

let wrapper, Ui, Pid, Sfx, volumeUpdate;
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

  socket: null,
  intervalFunction: null,

  volume: { level: 100, muted: false },

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

  resetRow: async function (row) {
    // stupid solution
    row.innerHTML = "";
  },

  play: async function (id) {
    // temporary player
    const audio = Sfx.getAudio();

    if (this.intervalFunction) {
      clearInterval(this.intervalFunction);
      this.intervalFunction = null;
    }

    audio.pause();

    Ui.transition("popOut", wrapper);
    wrapper.clear();
    let player = new Html("div")
      .id("player")
      .style({
        height: "100%",
        width: "100%",
      })
      .appendTo(wrapper);
    wrapper.class("full-ui");
    let playerFrame = new window.YT.Player("player", {
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
          Ui.transition("popIn", wrapper);
          playerFrame.setVolume(this.volume.level);
          volumeUpdate = (e) => {
            playerFrame.setVolume(e.detail);
            this.volume.level = e.detail;
          };
          document.addEventListener("CherryTree.Ui.VolumeChange", volumeUpdate);
          this.socket.emit("duration", playerFrame.getDuration());
          this.socket.on("resume", () => {
            playerFrame.playVideo();
          });
          this.socket.on("pause", () => {
            playerFrame.pauseVideo();
          });
          this.socket.on("seek", (pos) => {
            playerFrame.seekTo(pos);
          });
          this.socket.on("volume", (volume) => {
            playerFrame.setVolume(volume.level);
            document.dispatchEvent(
              // distribute the volume change event to show the volume indicator
              new CustomEvent("CherryTree.Input.VolumeChange")
            );
            this.volume.level = volume.level;
          });
          this.intervalFunction = setInterval(() => {
            this.socket.emit("position", playerFrame.getCurrentTime());
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

  searchAndQuery: async function () {
    await this.resetRow(this.searchRow);

    let options = {
      title: "YouTube Search Query",
      description: "Search YouTube for your query",
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
      Ui.init(
        this.Root.Pid,
        "horizontal",
        [
          this.topBar.elm.children,
          this.actionRow.elm.children,
          this.searchRow.elm.children,
        ],
        function (e) {
          if (e === "back") {
            pkg.end();
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
      wrapper.clear();
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

  start: async function (Root) {
    // store the root and other root related functions
    this.Root = Root;
    Pid = Root.Pid;

    // get the ui library
    Ui = Root.Processes.getService("UiLib").data;

    // create the topbar and other row elements
    wrapper = new Html("div")
      .style({ "max-width": "100%" })
      .class("ui", "pad-top", "gap")
      .appendTo("body");
    this.topBar = new Html("div").appendTo(wrapper);

    // pop in application and play sound effect
    Ui.transition("popIn", wrapper);
    Ui.becomeTopUi(Pid, wrapper);
    Sfx = Root.Processes.getService("SfxLib").data;
    Sfx.playSfx("deck_ui_into_game_detail.wav");
    const Background = Root.Processes.getService("Background").data;

    // get the volume level and set it to this.volume.level
    const audio = Sfx.getAudio();
    this.audio = audio;
    this.volume.level = Sfx.getVolume() * 100; //? (not sure what this is supposed to do) -tuck

    this.cast();

    await this.loadScript("https://www.youtube.com/iframe_api");

    this.topBar = await this.createRow(wrapper);
    this.actionRow = await this.createRow(wrapper);
    this.searchRow = await this.createRow(wrapper);

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
      let img = new Html("div").appendTo(actionWrapper).html(a.icon).styleJs({
        aspectRatio: "16 / 9",
        minWidth: "20rem",
        height: "11.50rem",
        borderRadius: "10px",
        backgroundColor: "#222",
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

    // const ytIconWidth = 168;
    // let icon = new Html("div")
    //   .appendTo(this.topBar)
    //   .html(icons.brandIcons.youtube.replace(`width="512"', 'width="${ytIconWidth}"`)); // stupid ass solution to seth the width
    let title = new Html("span").text("YouTube").appendTo(this.topBar);

    Ui.init(
      Pid,
      "horizontal",
      [
        this.topBar.elm.children,
        this.actionRow.elm.children,
        this.searchRow.elm.children,
      ],
      function (e) {
        if (e === "back") {
          pkg.end();
        }
      }
    );
  },
  end: async function () {
    // Exit this UI when the process is exited
    Ui.cleanup(Pid);
    Sfx.playSfx("deck_ui_out_of_game_detail.wav");
    // await Ui.transition("popOut", wrapper);
    document.removeEventListener("CherryTree.Ui.VolumeChange", volumeUpdate);
    Ui.giveUpUi(Pid);
    wrapper.cleanup();
  },
};

export default pkg;
