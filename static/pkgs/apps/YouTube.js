import icons from "../../libs/icons.js";
import Html from "/libs/html.js";

let wrapper, Ui, Pid, Sfx, volumeUpdate;

const pkg = {
  name: "YouTube",
  type: "app",
  privs: 0,
  searchRow: new Html("div"),
  socket: null,
  intervalFunction: null,

  resetRow: async function (row, appendTo) {
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
    let playerFrame = new YT.Player("player", {
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
          playerFrame.setVolume(Sfx.getVolume() * 100);
          this.socket.emit("volume", Sfx.getVolume() * 100);
          volumeUpdate = (e) => {
            playerFrame.setVolume(e.detail);
            this.socket.emit("volume", e.detail);
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
          });
          this.intervalFunction = setInterval(() => {
            this.socket.emit("position", playerFrame.getCurrentTime());
          }, 500);
        },
        onStateChange: (e) => {
          console.log("state change", e);
        },
      },
    });
  },

  searchAndQuery: async function (Root, audio, topBar) {
    await this.resetRow(this.searchRow);

    let options = {
      title: "YouTube Search Query",
      description: "Search YouTube for your query",
      parent: document.body,
      pid: Root.Pid,
      value: "",
      type: "text",
    };

    let result = (await Root.Libs.Modal.showKeyboard(options)).value;

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
      Ui.transition("popIn", thumbnailWrapper);
    });
  },

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

    const audio = Sfx.getAudio();

    const topBar = new Html("div").appendTo(wrapper);

    let Users = Root.Processes.getService("UserSvc").data;
    let info = await Users.getUserInfo(await Root.Security.getToken());
    let tvName = `${info.name}'s TV`;

    this.socket = io({
      auth: {
        name: tvName,
        screenName: "YouTube on Cherry Tree",
        brand: "Cherries.to",
        model: "Cherry Tree",
      },
    });

    this.socket.on("success", () => {
      console.log("TV is now discoverable");
      Root.Libs.Notify.show(
        "This TV is now discoverable",
        `This TV is being discovered as "${tvName}"`
      );
    });

    this.socket.on("clientConnected", (sender) => {
      console.log(sender);
      Root.Libs.Notify.show(
        `${sender.user.name} connected to this TV.`,
        `${sender.user.name}'s ${sender.name} connected to this TV.`
      );
    });

    this.socket.on("clientDisconnected", (sender) => {
      console.log(sender);
      Root.Libs.Notify.show(
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

    function loadScript(url) {
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
    }

    await loadScript("https://www.youtube.com/iframe_api");

    const row = new Html("div")
      .class("flex-list")
      .styleJs({
        overflow: "auto",
        // "align-items": "flex-end",
        width: "100%",
        // "min-height": "300px",
      })
      .appendTo(wrapper);

    this.searchRow = new Html("div")
      .class("flex-list")
      .styleJs({
        overflow: "auto",
        // "align-items": "flex-end",
        width: "100%",
        // "min-height": "300px",
      })
      .appendTo(wrapper);

    let actionList = [
      {
        name: "Search",
        icon: icons.search,
        action: () => {
          this.searchAndQuery(Root, wrapper, audio, topBar);
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
      let img = new Html("img")
        .appendTo(actionWrapper)
        .attr({ src: `data:image/svg+xml,${encodeURIComponent(a.icon)}` })
        .styleJs({
          aspectRatio: "16 / 9",
          minWidth: "20rem",
          height: "11.25rem",
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
      actionWrapper.appendTo(row);
    });

    let title = new Html("h1")
      .text("Early Alpha Youtube Client")
      .appendTo(topBar);

    Ui.init(
      Pid,
      "horizontal",
      [topBar.elm.children, this.searchRow.elm.children],
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
