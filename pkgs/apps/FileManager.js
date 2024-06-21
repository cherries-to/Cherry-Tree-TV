import Html from "/libs/html.js";

let wrapper, Ui, Pid, Sfx;

const pkg = {
  name: "File Manager",
  type: "app",
  privs: 0,
  start: async function (Root) {
    return new Promise((resolve, reject) => {
      Pid = Root.Pid;

      Ui = Root.Processes.getService("UiLib").data;

      wrapper = new Html("div").class("ui", "pad-top", "gap").appendTo("body");

      Ui.transition("popIn", wrapper);

      Ui.becomeTopUi(Pid, wrapper);

      Sfx = Root.Processes.getService("SfxLib").data;

      Sfx.playSfx("deck_ui_into_game_detail.wav");

      const Background = Root.Processes.getService("Background").data;

      let pathOpen = false;
      let curPath = "";

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

      async function GetDrives() {
        const url = `http://localhost:9864/drives`;
        const options = {
          method: "GET",
          headers: {
            accept: "application/json",
          },
        };
        return new Promise((resolve, reject) => {
          fetch(url, options)
            .then((res) => res.json())
            .then((json) => resolve(json))
            .catch((err) => reject("error:" + err));
        });
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

      async function openFile(path) {
        let fileName = path.split(/.*[\/|\\]/)[1];
        let re = /(?:\.([^.]+))?$/;
        let ext = re.exec(fileName)[1];
        let mapping = mappings[ext];
        if (mapping.type == "video") {
          Ui.transition("popOut", wrapper, 500, true);
          await Root.Libs.startPkg(
            mapping.opensWith,
            [{ app: "video", videoPath: path }],
            true
          );
        }
      }

      function closeSequence() {
        if (!pathOpen) {
          let respItem = {
            cancelled: true,
            selected: null,
          };
          if (launchArgs.callback) {
            launchArgs.callback(respItem);
          }
          pkg.end();
          return;
        }
        let trimmed = curPath.slice(0, -1);
        if (trimmed.split("/").length == 1) {
          console.log("rendering drives");
          Ui.transition("popOut", wrapper, 500, true);
          Sfx.playSfx("deck_ui_into_game_detail.wav");
          renderDrives();
        } else {
          let index = trimmed.lastIndexOf("/");
          let newPath = trimmed.slice(0, index) + "/";
          Ui.transition("popOut", wrapper, 500, true);
          renderList(newPath);
        }
      }

      console.log(Sfx);

      let UiElems = [];
      // let raw = sessionStorage.getItem("launch_args")
      //   ? sessionStorage.getItem("launch_args")
      //   : "{}";
      // let launchArgs = JSON.parse(raw);
      let launchArgs = Root.Arguments !== undefined ? Root.Arguments[0] : {};

      let folderSelector = false;

      if (launchArgs.folderSelect) {
        folderSelector = launchArgs.folderSelect;
      }

      let title = "File Manager";

      if (launchArgs.title) {
        title = launchArgs.title;
      }

      async function renderList(path) {
        let folder = await GetFolder(path);
        curPath = path;
        wrapper.clear();
        UiElems = [];
        new Html("h1").text(path).appendTo(wrapper);
        console.log(folder);
        folder.forEach((item) => {
          let row = new Html("div")
            .class("flex-list")
            .appendTo(wrapper)
            .styleJs({ width: "100%" });
          new Html("button")
            .text(item.name)
            .styleJs({ width: "100%" })
            .appendTo(row)
            .on("click", () => {
              console.log(item);
              if (item.type == "folder") {
                pathOpen = true;
                Ui.transition("popOut", wrapper, 500, true);
                renderList(path + item.name + "/");
              } else {
                openFile(path + item.name);
              }
            });
          if (folderSelector && item.type == "folder") {
            new Html("button")
              .text("Select folder")
              .appendTo(row)
              .on("click", () => {
                let respItem = {
                  cancelled: false,
                  selected: path + item.name + "/",
                };
                if (launchArgs.callback) {
                  launchArgs.callback(respItem);
                }
                resolve(respItem);
                pkg.end();
              });
          }
          UiElems.push(row.elm.children);
        });
        Sfx.playSfx("deck_ui_into_game_detail.wav");
        Ui.transition("popIn", wrapper);
        Ui.init(Pid, "horizontal", UiElems, function (e) {
          if (e === "menu" || e === "back") {
            closeSequence();
          }
        });
      }

      async function renderDrives() {
        wrapper.clear();
        UiElems = [];
        pathOpen = false;
        new Html("h1").text(title).appendTo(wrapper);
        let drives = await GetDrives();
        drives.forEach((drive) => {
          let row = new Html("div")
            .class("flex-list")
            .appendTo(wrapper)
            .styleJs({ width: "100%" });
          new Html("button")
            .text(drive)
            .styleJs({ width: "100%" })
            .appendTo(row)
            .on("click", () => {
              pathOpen = true;
              Ui.transition("popOut", wrapper, 500, true);
              renderList(drive + "/");
            });
          UiElems.push(row.elm.children);
        });
        Ui.transition("popIn", wrapper);
        Ui.init(Pid, "horizontal", UiElems, function (e) {
          if (e === "menu" || e === "back") {
            closeSequence();
          }
        });
      }

      renderDrives();

      if (Root.Arguments.length === 0) resolve();
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
