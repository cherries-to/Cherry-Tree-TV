import Html from "/libs/html.js";

let wrapper, Ui, Pid, Sfx;

const pkg = {
  name: "Video Player",
  type: "app",
  privs: 0,
  start: async function (Root) {
    Pid = Root.Pid;

    Ui = Root.Processes.getService("UiLib").data;

    wrapper = new Html("div").class("full-ui").appendTo("body");

    Ui.becomeTopUi(Pid, wrapper);

    Sfx = Root.Processes.getService("SfxLib").data;

    Sfx.playSfx("deck_ui_into_game_detail.wav");

    const Background = Root.Processes.getService("Background").data;
    let ws = Root.Security.getSecureVariable("CHERRY_TREE_WS");

    console.log(Sfx);

    const audio = Sfx.getAudio();

    function stopBgm() {
      audio.pause();
    }
    async function playBgm() {
      let playBgm = await localforage.getItem("settings__playBgm");
      if (playBgm) {
        audio.play();
      }
    }

    async function GetFolder(path) {
      const url = `http://localhost:9864/list`;
      const options = {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ dir: path }),
      };
      return new Promise((resolve, reject) => {
        fetch(url, options)
          .then((res) => res.json())
          .then((json) => resolve(json))
          .catch((err) => reject("error:" + err));
      });
    }

    async function findCaptions(path) {
      let rootFolder = path.substring(0, path.lastIndexOf("/") + 1);
      let fileName = path.split(/.*[\/|\\]/)[1];
      let noExt = fileName.replace(/\.[^/.]+$/, "");
      console.log(rootFolder);
      console.log(noExt);
      let folder = await GetFolder(rootFolder);
      let foundCaptions = [];
      folder.forEach((item) => {
        if (item.type == "file") {
          let re = /(?:\.([^.]+))?$/;
          let ext = re.exec(item.name)[1];
          console.log(ext);
          console.log(item.name);
          if (ext == "vtt" && item.name.startsWith(noExt)) {
            console.log(`[Captions] Found caption ${item.name}`);
            foundCaptions.push(rootFolder + item.name);
          }
        }
      });
      console.log(foundCaptions);
      return foundCaptions;
    }

    let videoElm;
    let invButton;
    let top;
    let bottom;
    let playPause;
    let progress;
    let timeElapsed;
    let captionToggle;
    let vidInfo;

    let icons = {
      play: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-play"><polygon points="6 3 20 12 6 21 6 3"/></svg>',
      pause:
        '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-pause"><rect x="14" y="4" width="4" height="16" rx="1"/><rect x="6" y="4" width="4" height="16" rx="1"/></svg>',
      stepBack:
        '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-step-back"><line x1="18" x2="18" y1="20" y2="4"/><polygon points="14,20 4,12 14,4"/></svg>',
      stepForward:
        '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-step-forward"><line x1="6" x2="6" y1="4" y2="20"/><polygon points="10,4 20,12 10,20"/></svg>',
      captionsOn:
        '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-captions"><rect width="18" height="14" x="3" y="5" rx="2" ry="2"/><path d="M7 15h4M15 15h2M7 11h2M13 11h4"/></svg>',
      captionsOff:
        '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-captions"><rect width="18" height="14" x="3" y="5" rx="2" ry="2"/><path d="M7 15h4M15 15h2M7 11h2M13 11h4"/></svg>',
    };

    function formatTime(timeInSeconds) {
      const result = new Date(timeInSeconds * 1000).toISOString().slice(11, 19);

      return {
        minutes: result.slice(3, 5),
        seconds: result.slice(6, 8),
      };
    }

    function playVideo(path, captions = null, displayName = null) {
      let urlObj = new URL("http://127.0.0.1:9864/getFile");
      urlObj.searchParams.append("path", path);
      let url = urlObj.href;
      videoElm = new Html("video")
        .appendTo(wrapper)
        .styleJs({ width: "100%", height: "100%", position: "absolute" })
        .attr({ src: url, crossorigin: "anonymous" });
      videoElm.elm.controls = false;
      top = new Html("div").class("flex-list").appendTo(wrapper).styleJs({
        position: "absolute",
        width: "100%",
        position: "absolute",
        top: 0,
        zIndex: "100",
      });
      invButton = new Html("button")
        .text("You should not see this!")
        .appendTo(top)
        .styleJs({
          opacity: 0,
        });
      bottom = new Html("div")
        .class("flex-list")
        .appendTo(wrapper)
        .styleJs({
          position: "absolute",
          bottom: "0",
          zIndex: "100",
          width: "100%",
          opacity: 0,
          height: "50px",
          backgroundColor: "rgba(0,0,0,0.5)",
          transition: "all 0.1s linear",
        })
        .appendTo(wrapper);
      vidInfo = new Html("div").class("flex-column").appendTo(wrapper).styleJs({
        position: "absolute",
        top: "0",
        zIndex: "99",
        opacity: 0,
        height: "100%",
        width: "100%",
        background: "linear-gradient(to top, #0000, #000f)",
        transition: "all 0.1s linear",
      });
      let fileName = path.split(/.*[\/|\\]/)[1];
      let noExt = fileName.replace(/\.[^/.]+$/, "");
      // if (ws) {
      //   ws.sendMessage({
      //     type: "chat",
      //     message: JSON.stringify({
      //       type: "watchParty",
      //       file: displayName ? displayName : noExt,
      //     }),
      //   });
      // }
      new Html("h1")
        .text(displayName ? displayName : noExt)
        .appendTo(vidInfo)
        .styleJs({
          padding: "50px",
        });
      playPause = new Html("button")
        .html(icons["pause"])
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
          height: "50px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "0",
        });
      timeElapsed = new Html("p")
        .text("00:00 / 00:00")
        .appendTo(bottom)
        .styleJs({ width: "10%" });
      progress = new Html("input").appendTo(bottom).styleJs({
        width: "50%",
        color: "var(--current-player)",
        border: "none",
      });
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
          height: "50px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "0",
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
          height: "50px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "0",
        });
      captionToggle = new Html("button")
        .html(icons["captionsOff"])
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
          width: "20%",
          height: "50px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "0",
        });
      if (captions) {
        captions.forEach((caption, index) => {
          let urlObj = new URL("http://127.0.0.1:9864/getFile");
          let fileName = caption.split(/.*[\/|\\]/)[1];
          let noExt = fileName.replace(/\.[^/.]+$/, "");
          urlObj.searchParams.append("path", caption);
          let captionDefault = false;
          if (index == 0) {
            captionDefault = true;
            captionToggle.html(icons["captionsOn"]);
          }
          new Html("track")
            .attr({ src: urlObj.href, label: noExt, default: captionDefault })
            .appendTo(videoElm);
        });
      }
      videoElm.on("loadedmetadata", () => {
        const videoDuration = Math.round(videoElm.elm.duration);
        const time = formatTime(videoDuration);
        timeElapsed.text(`00:00 / ${time.minutes}:${time.seconds}`);
        progress.attr({
          type: "range",
          min: 0,
          max: videoElm.elm.duration,
          value: 0,
        });
      });
      videoElm.on("timeupdate", () => {
        const videoDuration = Math.round(videoElm.elm.duration);
        const duration = formatTime(videoDuration);
        const videoElapsed = Math.round(videoElm.elm.currentTime);
        const elapsed = formatTime(videoElapsed);
        timeElapsed.text(
          `${elapsed.minutes}:${elapsed.seconds} / ${duration.minutes}:${duration.seconds}`
        );
        progress.attr({
          type: "range",
          min: 0,
          max: videoElm.elm.duration,
          value: videoElm.elm.currentTime,
        });
      });
      videoElm.on("play", () => {
        playPause.html(icons["pause"]);
        Sfx.playSfx("deck_ui_switch_toggle_on.wav");
        stopBgm();
      });
      videoElm.on("pause", () => {
        playPause.html(icons["play"]);
        Sfx.playSfx("deck_ui_switch_toggle_off.wav");
        playBgm();
      });
      Ui.transition("popIn", wrapper);
      videoElm.elm.play();
    }

    // let raw = sessionStorage.getItem("launch_args")
    //   ? sessionStorage.getItem("launch_args")
    //   : "{}";
    // let launchArgs = JSON.parse(raw);
    let launchArgs = Root.Arguments[0];
    if (launchArgs.app == "video") {
      let path = launchArgs.videoPath;
      let captions = await findCaptions(path);
      let displayName = null;
      if (launchArgs.displayName) {
        displayName = launchArgs.displayName;
      }
      playVideo(path, captions, displayName);
    }

    Ui.init(
      Pid,
      "horizontal",
      [top.elm.children, bottom.elm.children],
      function (e) {
        if (e === "menu" || e === "back") {
          pkg.end();
        }
        setTimeout(() => {
          let atTop = invButton.elm.classList.contains("over");
          if (atTop) {
            bottom.styleJs({ opacity: "0" });
            vidInfo.styleJs({ opacity: "0" });
          } else {
            bottom.styleJs({ opacity: "1" });
            vidInfo.styleJs({ opacity: "1" });
          }
        }, 50);
        // if (e.x === -1 && videoElm) {
        //   videoElm.elm.controls = true;
        //   videoElm.elm.pause();
        // }
        // if (e.x === 0 && videoElm) {
        //   videoElm.elm.controls = false;
        //   videoElm.elm.play();
        // }
        // console.log(e);
      }
    );
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
