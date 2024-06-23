import Html from "/libs/html.js";

let wrapper, Ui, Pid, Sfx;

const pkg = {
  name: "Show Viewer",
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

    let launchArgs = Root.Arguments !== undefined ? Root.Arguments[0] : {};
    let callback =
      Root.Arguments !== undefined ? Root.Arguments[1].callback : null;

    console.log(Sfx);

    let mappings = {
      txt: {
        type: "text",
        label: "Text document",
        opensWith: "apps:Notepad",
        icon: "file",
      },
      panic: {
        type: "text",
        label: "Panic Log",
        opensWith: "apps:Notepad",
        icon: "filePanic",
      },
      md: {
        type: "text",
        label: "Markdown document",
        opensWith: "apps:Notepad",
        icon: "fileMd",
      },
      app: {
        type: "executable",
        label: "Executable Application",
        opensWith: "evaluate",
        ctxMenuApp: {
          launch: "apps:DevEnv",
          name: "systemApp_DevEnv",
        },
        icon: "box",
      },
      pml: {
        type: "executable",
        label: "PML Application",
        opensWith: "apps:PML",
        ctxMenuApp: {
          launch: "apps:DevEnv",
          name: "systemApp_DevEnv",
        },
        icon: "box",
      },
      json: {
        type: "code",
        label: "JSON file",
        opensWith: "apps:DevEnv",
        icon: "fileJson",
      },
      js: {
        type: "code",
        label: "JavaScript file",
        opensWith: "apps:DevEnv",
        icon: "fileJson",
      },
      png: {
        type: "image",
        label: "PNG image",
        opensWith: "apps:ImageViewer",
        icon: "fileImage",
      },
      jpg: {
        type: "image",
        label: "JPG image",
        opensWith: "apps:ImageViewer",
        icon: "fileImage",
      },
      jpeg: {
        type: "image",
        label: "JPG image",
        opensWith: "apps:ImageViewer",
        icon: "fileImage",
      },
      gif: {
        type: "image",
        label: "GIF image",
        opensWith: "apps:ImageViewer",
        icon: "fileImage",
      },
      mp4: {
        type: "video",
        label: "MP4 video",
        opensWith: "apps:VideoPlayer",
        icon: "fileVideo",
      },
      mov: {
        type: "video",
        label: "MOV video",
        opensWith: "apps:VideoPlayer",
        icon: "fileVideo",
      },
      mkv: {
        type: "video",
        label: "MKV video",
        opensWith: "apps:VideoPlayer",
        icon: "fileVideo",
      },
      avi: {
        type: "video",
        label: "AVI video",
        opensWith: "apps:VideoPlayer",
        icon: "fileVideo",
      },
      webm: {
        type: "video",
        label: "WebM video",
        opensWith: "apps:VideoPlayer",
        icon: "fileVideo",
      },
      wav: {
        type: "audio",
        label: "WAV audio",
        opensWith: "apps:AudioPlayer",
        icon: "fileAudio",
      },
      m4a: {
        type: "audio",
        label: "MPEG audio",
        opensWith: "apps:AudioPlayer",
        icon: "fileAudio",
      },
      mp3: {
        type: "audio",
        label: "MP3 audio",
        opensWith: "apps:AudioPlayer",
        icon: "fileAudio",
      },
      shrt: {
        type: "text",
        label: "Desktop shortcut",
        opensWith: "apps:Notepad",
      },
      theme: {
        type: "text",
        label: "Theme",
        opensWith: "apps:Notepad",
        icon: "brush",
      },
    };

    let UiElems = [];

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

    async function closeSequence() {
      cover.styleJs({ opacity: "0", transform: "scale(1.5)" });
      document.dispatchEvent(
        new CustomEvent("CherryTree.Ui.ChangeBackground", {
          detail: {
            background: `inherit`,
          },
        })
      );
      setTimeout(() => {
        cover.cleanup();
      }, 500);
      if (launchArgs.callback) {
        launchArgs.callback(responseData);
      }
      pkg.end();
    }

    let cover = new Html("img")
      .styleJs({
        zIndex: -1,
        filter: "brightness(20%)",
        position: "absolute",
        top: "0",
        left: "0",
        width: "100%",
        height: "100%",
        opacity: "0",
        aspectRatio: "16 / 9",
        objectFit: "cover",
        transform: "scale(1.5)",
        transition: "all 0.5s cubic-bezier(0.87, 0, 0.13, 1)",
      })
      .appendTo("body");

    new Html("img")
      .attr({ src: launchArgs.showPoster })
      .styleJs({
        width: "15vw",
        borderRadius: "10px",
      })
      .appendTo(wrapper);

    new Html("h2")
      .text(launchArgs.season ? `Season ${launchArgs.season}` : "Season 1")
      .appendTo(wrapper);
    new Html("h1").text(launchArgs.showName).appendTo(wrapper);
    new Html("p")
      .text(
        launchArgs.showDesc
          ? launchArgs.showDesc
          : "This show doesn't have an overview."
      )
      .appendTo(wrapper);

    setTimeout(() => {
      if (!launchArgs.nsfw) {
        cover.attr({ src: launchArgs.showCover });
        cover.styleJs({ opacity: "1", transform: "scale(1)" });
        document.dispatchEvent(
          new CustomEvent("CherryTree.Ui.ChangeBackground", {
            detail: {
              background: `url(${launchArgs.showCover})`,
            },
          })
        );
      } else {
        Root.Libs.Notify.show(
          "Cover hidden",
          `This show contains NSFW content`
        );
        cover.styleJs({ opacity: "0", transform: "scale(1.5)" });
      }
    }, 100);

    let sortCreated = true;

    let buttons = [];
    async function renderEpisodes(sortCreated = true) {
      buttons.forEach((button) => {
        button.cleanup();
        let index = UiElems.indexOf(button);
        UiElems.splice(index, 1);
      });

      buttons = [];

      let folder = await GetFolder(launchArgs.showFolder);
      if (sortCreated) {
        folder.sort(function (x, y) {
          return x.created - y.created;
        });
      } else {
        folder.sort(function (x, y) {
          return x.modified - y.modified;
        });
      }

      console.log(folder);
      let episodesFound = 0;
      let episodes = {};
      folder.forEach((item, index) => {
        let re = /(?:\.([^.]+))?$/;
        let ext = re.exec(item.name)[1];
        console.log(ext);
        let mapping = mappings[ext];
        if (mapping && mapping.type == "video") {
          episodesFound = episodesFound + 1;
          episodes[item.name] = episodesFound.valueOf();
          console.log(item);
          let row = new Html("div")
            .class("flex-list")
            .appendTo(wrapper)
            .styleJs({ width: "100%" });
          new Html("button")
            .text(item.name.replace(/\.[^/.]+$/, ""))
            .styleJs({ width: "100%" })
            .appendTo(row)
            .on("click", async () => {
              console.log(item);
              Ui.transition("popOut", wrapper, 500, true);
              await Root.Libs.startPkg(
                mapping.opensWith,
                [
                  {
                    app: "video",
                    videoPath: launchArgs.showFolder + item.name,
                    displayName: `${launchArgs.showName} ${
                      launchArgs.season ? `S${launchArgs.season}` : "S1"
                    } EP${episodes[item.name]}`,
                  },
                ],
                true
              );
            });
          UiElems.push(row.elm.children);
          buttons.push(row);
          Ui.init(Pid, "horizontal", UiElems, function (e) {
            if (e === "back") {
              closeSequence();
            }
          });
        }
      });
    }
    const row = new Html("div").class("flex-list").appendTo(wrapper);
    let sortButton = new Html("button")
      .text(`Sort by ${sortCreated ? "file creation" : "file modified"}`)
      .on("click", () => {
        sortCreated = sortCreated ? false : true;
        sortButton.text(
          `Sort by ${sortCreated ? "file creation" : "file modified"}`
        );
        renderEpisodes(sortCreated);
      })
      .appendTo(row);
    new Html("button")
      .text("Remove show")
      .on("click", async () => {
        let result = await Root.Libs.Modal.Show({
          parent: wrapper,
          pid: Root.Pid,
          title: "Are you sure you want to remove this show?",
          description: "This show will be removed in your library.",
          buttons: [
            {
              type: "primary",
              text: "No",
            },
            {
              type: "negative",
              text: "Yes",
            },
          ],
        });
        if (result.id == 1) {
          callback(true);
          closeSequence();
        }
      })
      .appendTo(row);

    UiElems.push(row.elm.children);
    renderEpisodes(sortCreated);

    Ui.init(Pid, "horizontal", UiElems, function (e) {
      if (e === "back") {
        closeSequence();
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
