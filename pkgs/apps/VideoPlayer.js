import Html from "/libs/html.js";
import {
  CaptionsRenderer,
  parseResponse,
} from "../../node_modules/media-captions/dist/prod.js";

console.log(CaptionsRenderer);

let wrapper, Ui, Users, Pid, Sfx, volumeUpdate;
let friends = [];

const pkg = {
  name: "Video Player",
  type: "app",
  privs: 0,
  start: async function (Root) {
    Pid = Root.Pid;

    Ui = Root.Processes.getService("UiLib").data;
    Users = Root.Processes.getService("UserSvc").data;
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
      console.log(foundCaptions.length);
      if (foundCaptions.length > 0) {
        return foundCaptions;
      } else {
        return null;
      }
    }

    let videoElm;
    let invButton;
    let top;
    let bottom;
    let playPause;
    let progress;
    let timeElapsed, timeElapsedFront, timeElapsedMiddle, timeElapsedBack;
    let captionToggle;
    let vidInfo;
    let captionOverlay;
    let renderer;
    let trackFetchAbort;
    let captionIndex = 0;

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
        '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-captions-off"><path d="M10.5 5H19a2 2 0 0 1 2 2v8.5"/><path d="M17 11h-.5"/><path d="M19 19H5a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2"/><path d="m2 2 20 20"/><path d="M7 11h4"/><path d="M7 15h2.5"/></svg>',
      broadcast:
        '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-radio"><path d="M4.9 19.1C1 15.2 1 8.8 4.9 4.9"/><path d="M7.8 16.2c-2.3-2.3-2.3-6.1 0-8.5"/><circle cx="12" cy="12" r="2"/><path d="M16.2 7.8c2.3 2.3 2.3 6.1 0 8.5"/><path d="M19.1 4.9C23 8.8 23 15.1 19.1 19"/></svg>',
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
          bottom: "1rem",
          zIndex: "100",
          width: "calc(100% - 2rem)",
          opacity: "1",
          left: "1rem",
          backgroundColor: "rgba(0, 0, 0, 0.5)",
          transition: "0.1s linear",
          padding: "1rem",
          borderRadius: "8px",
          opacity: "0",
        })
        .appendTo(wrapper);
      captionOverlay = new Html("div")
        .styleJs({
          bottom: "48px",
          transition: "all 0.1s cubic-bezier(0.87, 0, 0.13, 1)",
        })
        .appendTo(wrapper);
      renderer = new CaptionsRenderer(captionOverlay.elm);
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
          minWidth: "50px",
          height: "50px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "0",
        });
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
      progress = new Html("input").appendTo(bottom).styleJs({
        "flex-grow": "1",
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
          minWidth: "50px",
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
          minWidth: "50px",
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
        .styleJs({
          minWidth: "50px",
          height: "50px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "0",
        });
      new Html("button")
        .html(icons["broadcast"])
        .appendTo(bottom)
        .styleJs({
          minWidth: "50px",
          height: "50px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "0",
        })
        .on("click", async (e) => {
          if (ws) {
            friends = (await ws.sendMessage({ type: "get-friends" })).result;
            console.log(friends);
            let overlay = new Html("div")
              .styleJs({
                width: "350px",
                height: "600px",
                background: "rgba(0,0,0,0.5)",
                position: "absolute",
                top: "50px",
                left: "50px",
                zIndex: 1000000,
                backdropFilter: "blur(50px)",
                borderRadius: "10px",
                display: "flex",
                flexDirection: "column",
                padding: "25px",
                overflow: "scroll",
                gap: "10px",
              })
              .appendTo(wrapper);
            new Html("h1").text("Invite a friend").appendTo(overlay);
            new Html("p")
              .html(
                `Get a friend to watch <strong>${
                  displayName ? displayName : noExt
                }</strong> with you`
              )
              .appendTo(overlay);
            new Html("br").appendTo(overlay);
            new Html("h2")
              .text("Who's online")
              .appendTo(overlay)
              .styleJs({ paddingBottom: "10px" });
            let tempUiElems = [];
            let hasFriend = false;
            friends.forEach((friend) => {
              if (friend.status == 1) {
                console.log(friend);
                hasFriend = true;
                let row = new Html("div")
                  .class("flex-list")
                  .appendTo(overlay)
                  .styleJs({ width: "100%" });
                new Html("button")
                  .text(friend.name)
                  .appendTo(row)
                  .styleJs({ width: "100%" })
                  .on("click", () => {
                    let friendId = friend.id;
                    console.log(friend.id);
                    ws.sendMessage({
                      type: "watchParty",
                      id: friendId,
                      message: JSON.stringify({
                        name: displayName ? displayName : noExt,
                      }),
                    });
                  });
                tempUiElems.push(row.elm.children);
              }
            });
            if (!hasFriend) {
              let row = new Html("div")
                .class("flex-list")
                .appendTo(overlay)
                .styleJs({ width: "100%" });
              new Html("button")
                .text("None of your friends are online")
                .appendTo(row)
                .styleJs({ width: "100%" });
              tempUiElems.push(row.elm.children);
            }
            Sfx.playSfx("deck_ui_into_game_detail.wav");
            Ui.transition("popIn", overlay);
            bottom.styleJs({ opacity: "0" });
            vidInfo.styleJs({ opacity: "0" });
            captionOverlay.styleJs({ bottom: "48px" });
            e.target.classList.remove("over");
            Ui.init(Pid, "horizontal", tempUiElems, function (e) {
              if (e === "menu" || e === "back") {
                Sfx.playSfx("deck_ui_out_of_game_detail.wav");
                Ui.transition("popOut", overlay);
                setTimeout(() => {
                  overlay.cleanup();
                  bottom.styleJs({ opacity: "1" });
                  vidInfo.styleJs({ opacity: "1" });
                  captionOverlay.styleJs({
                    bottom: "calc(48px + 3rem)",
                  });
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
                          captionOverlay.styleJs({ bottom: "48px" });
                        } else {
                          bottom.styleJs({ opacity: "1" });
                          vidInfo.styleJs({ opacity: "1" });
                          captionOverlay.styleJs({
                            bottom: "calc(48px + 3rem)",
                          });
                        }
                      }, 50);
                    }
                  );
                }, 200);
              }
            });
          }
        });
      if (captions != null) {
        let urlObj = new URL("http://127.0.0.1:9864/getFile");
        urlObj.searchParams.append("path", captions[0]);
        captionToggle.html(icons["captionsOn"]);
        loadNewTrack(urlObj.href);
        captionToggle.on("click", (e) => {
          let overlay = new Html("div")
            .styleJs({
              width: "350px",
              height: "600px",
              background: "rgba(0,0,0,0.5)",
              position: "absolute",
              top: "50px",
              left: "50px",
              zIndex: 1000000,
              backdropFilter: "blur(50px)",
              borderRadius: "10px",
              display: "flex",
              flexDirection: "column",
              padding: "25px",
              overflow: "scroll",
              gap: "10px",
            })
            .appendTo(wrapper);
          new Html("h1").text("Captions").appendTo(overlay);
          new Html("p")
            .html(
              `Enable captions for <strong>${
                displayName ? displayName : noExt
              }</strong>`
            )
            .appendTo(overlay);
          new Html("br").appendTo(overlay);
          let tempUiElems = [];
          captions.forEach((caption) => {
            let fileName = caption.split(/.*[\/|\\]/)[1];
            let noExt = fileName.replace(/\.[^/.]+$/, "");
            let re = /(?:\.([^.]+))?$/;
            let lang = re.exec(noExt)[1];
            console.log(caption);
            let row = new Html("div")
              .class("flex-list")
              .appendTo(overlay)
              .styleJs({ width: "100%" });
            new Html("button")
              .text(lang)
              .appendTo(row)
              .styleJs({ width: "100%" })
              .on("click", () => {
                let urlObj = new URL("http://127.0.0.1:9864/getFile");
                urlObj.searchParams.append("path", caption);
                loadNewTrack(urlObj.href);
                Root.Libs.Notify.show(
                  `Captions toggled`,
                  `Now using caption ${lang}`
                );
              });
            tempUiElems.push(row.elm.children);
          });
          Sfx.playSfx("deck_ui_into_game_detail.wav");
          Ui.transition("popIn", overlay);
          bottom.styleJs({ opacity: "0" });
          vidInfo.styleJs({ opacity: "0" });
          captionOverlay.styleJs({ bottom: "48px" });
          e.target.classList.remove("over");
          Ui.init(Pid, "horizontal", tempUiElems, function (e) {
            if (e === "menu" || e === "back") {
              Sfx.playSfx("deck_ui_out_of_game_detail.wav");
              Ui.transition("popOut", overlay);
              setTimeout(() => {
                overlay.cleanup();
                bottom.styleJs({ opacity: "1" });
                vidInfo.styleJs({ opacity: "1" });
                captionOverlay.styleJs({
                  bottom: "calc(48px + 3rem)",
                });
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
                        captionOverlay.styleJs({ bottom: "48px" });
                      } else {
                        bottom.styleJs({ opacity: "1" });
                        vidInfo.styleJs({ opacity: "1" });
                        captionOverlay.styleJs({
                          bottom: "calc(48px + 3rem)",
                        });
                      }
                    }, 50);
                  }
                );
              }, 200);
            }
          });
        });
      } else {
        captionToggle.on("click", () => {
          Root.Libs.Notify.show(
            `This video doesn't have captions`,
            `To show captions, please put subtitle files (.vtt) in the video's directory.`
          );
        });
      }
      videoElm.on("loadedmetadata", () => {
        const videoDuration = Math.round(videoElm.elm.duration);
        const time = formatTime(videoDuration);
        timeElapsedFront.text("00:00");
        timeElapsedBack.text(`${time.minutes}:${time.seconds}`);
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
        timeElapsedFront.text(`${elapsed.minutes}:${elapsed.seconds}`);
        timeElapsedBack.text(`${duration.minutes}:${duration.seconds}`);
        progress.attr({
          type: "range",
          min: 0,
          max: videoElm.elm.duration,
          value: videoElm.elm.currentTime,
        });
        renderer.currentTime = videoElm.elm.currentTime;
      });
      videoElm.elm.volume = Sfx.getVolume();
      volumeUpdate = (e) => {
        videoElm.elm.volume = e.detail / 100;
      };
      document.addEventListener("CherryTree.Ui.VolumeChange", volumeUpdate);
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

    async function loadNewTrack(captionPath) {
      try {
        trackFetchAbort?.abort();

        const signal = (trackFetchAbort = new AbortController()).signal;

        const { regions, cues } = await parseResponse(
          fetch(captionPath, { signal })
        );

        renderer.changeTrack({ regions, cues });
      } catch (e) {
        console.log(`Aborted loading subtitle track!`, e);
      }
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
            captionOverlay.styleJs({ bottom: "48px" });
          } else {
            bottom.styleJs({ opacity: "1" });
            vidInfo.styleJs({ opacity: "1" });
            captionOverlay.styleJs({ bottom: "calc(48px + 3rem)" });
          }
        }, 50);
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
    document.removeEventListener("CherryTree.Ui.VolumeChange", volumeUpdate);
  },
};

export default pkg;
