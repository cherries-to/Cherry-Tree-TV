import Html from "/libs/html.js";

let wrapper, Ui, Pid, Sfx;

const pkg = {
  name: "Show Viewer",
  type: "app",
  privs: 0,
  start: async function (Root) {
    Pid = Root.Pid;

    Ui = Root.Processes.getService("UiLib").data;

    wrapper = new Html("div")
      .class("full-ui")
      .styleJs({
        display: "flex",
        flexDirection: "row",
      })
      .appendTo("body");

    let coverWrapper = new Html("div")
      .styleJs({
        width: "35%",
        height: "100%",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      })
      .appendTo(wrapper);

    let contentWrapper = new Html("div")
      .styleJs({
        width: "62.5%",
        height: "100%",
        overflow: "scroll",
        display: "flex",
        flexDirection: "column",
        gap: "20px",
        scrollBehavior: "smooth",
      })
      .appendTo(wrapper);

    Ui.transition("popIn", wrapper);

    Ui.becomeTopUi(Pid, wrapper);

    Sfx = Root.Processes.getService("SfxLib").data;

    Sfx.playSfx("deck_ui_into_game_detail.wav");

    const Background = Root.Processes.getService("Background").data;

    let launchArgs = Root.Arguments !== undefined ? Root.Arguments[0] : {};
    let callback =
      Root.Arguments !== undefined ? Root.Arguments[1].callback : null;

    if (!launchArgs.showPoster) {
      wrapper.styleJs({
        alignItems: "center",
        justifyContent: "center",
      });
      contentWrapper.styleJs({
        width: "80%",
      });
      coverWrapper.styleJs({
        width: "0",
      });
    }

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
        }),
      );
      setTimeout(() => {
        cover.cleanup();
      }, 500);
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
        width: "80%",
        borderRadius: "10px",
      })
      .appendTo(coverWrapper);

    new Html("br")
      .styleJs({
        height: "20%",
      })
      .appendTo(contentWrapper);

    new Html("h2")
      .text(launchArgs.season ? `Season ${launchArgs.season}` : "Season 1")
      .appendTo(contentWrapper);
    new Html("h1").text(launchArgs.showName).appendTo(contentWrapper);
    new Html("p")
      .text(
        launchArgs.showDesc
          ? launchArgs.showDesc
          : "This show doesn't have an overview.",
      )
      .appendTo(contentWrapper);

    setTimeout(() => {
      if (!launchArgs.nsfw) {
        cover.attr({ src: launchArgs.showCover });
        cover.styleJs({ opacity: "1", transform: "scale(1)" });
        document.dispatchEvent(
          new CustomEvent("CherryTree.Ui.ChangeBackground", {
            detail: {
              background: `url(${launchArgs.showCover})`,
            },
          }),
        );
      } else {
        Root.Libs.Notify.show(
          "Cover hidden",
          `This show contains NSFW content`,
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
      const fragment = document.createDocumentFragment();

      let folder = await GetFolder(launchArgs.showFolder);
      if (sortCreated) {
        folder.sort((x, y) => x.created - y.created);
      } else {
        folder.sort((x, y) => x.modified - y.modified);
      }

      const extRegex = /(?:\.([^.]+))?$/;
      const flexListStyle = { width: "100%" };
      const imageStyle = {
        aspectRatio: "16 / 9",
        height: "85%",
        borderRadius: "5px",
        backgroundColor: "#2228", // Placeholder background
        transition: "opacity 0.3s ease",
      };

      // Create intersection observer for lazy loading
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              const img = entry.target;
              if (img.dataset.src) {
                img.src = img.dataset.src;
                img.style.opacity = "0";
                img.onload = () => {
                  img.style.opacity = "1";
                };
                img.onerror = () => {
                  img.style.opacity = "1";
                  img.style.backgroundColor = "#500";
                };
                observer.unobserve(img);
              }
            }
          });
        },
        {
          rootMargin: "50px",
        },
      );

      const showCountNameStyle = {
        display: "flex",
        flexDirection: "column",
        gap: "5px",
        width: "50%",
      };
      const buttonStyle = {
        width: "100%",
        height: "200px",
        display: "flex",
        gap: "15px",
        alignItems: "center",
        justifyContent: "center",
      };
      const h1Style = { textAlign: "left", fontSize: "4em" };
      const pStyle = { textAlign: "left" };

      const thumbnailBaseUrl = new URL("http://localhost:9864/thumbnail");
      let episodesFound = 0;
      const episodes = {};

      for (const item of folder) {
        const ext = extRegex.exec(item.name)[1];
        const mapping = mappings[ext];

        if (mapping && mapping.type === "video") {
          episodesFound++;
          episodes[item.name] = episodesFound;

          const row = new Html("div").class("flex-list").styleJs(flexListStyle);

          const thumbnailURL = new URL(thumbnailBaseUrl);
          thumbnailURL.searchParams.set(
            "path",
            launchArgs.showFolder + item.name,
          );

          const showPreview = new Html("img")
            .styleJs({ ...imageStyle, opacity: "0" })
            .attr({ "data-src": thumbnailURL.toString() });

          // Observe the image element
          observer.observe(showPreview.elm);

          const showCountName = new Html("div").styleJs(showCountNameStyle);
          new Html("h1")
            .text(episodes[item.name])
            .appendTo(showCountName)
            .styleJs(h1Style);
          new Html("p")
            .text(item.name.replace(/\.[^/.]+$/, ""))
            .appendTo(showCountName)
            .styleJs(pStyle);

          new Html("button")
            .appendMany(showPreview, showCountName)
            .styleJs(buttonStyle)
            .appendTo(row)
            .on("click", async () => {
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
                true,
              );
            });

          fragment.appendChild(row.elm);
          buttons.push(row);
          UiElems.push(row.elm.children);
        }
      }

      contentWrapper.elm.appendChild(fragment);
      Ui.update(Pid, UiElems);
    }

    const row = new Html("div").class("flex-list").appendTo(contentWrapper);
    let sortButton = new Html("button")
      .text(`Sort by ${sortCreated ? "file creation" : "file modified"}`)
      .on("click", () => {
        sortCreated = sortCreated ? false : true;
        sortButton.text(
          `Sort by ${sortCreated ? "file creation" : "file modified"}`,
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
          description: "This show will be removed from your library.",
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
      setTimeout(() => {
        let scrolled = false;
        for (const div of buttons) {
          let button = div.elm.children[0];
          let focused = button.classList.contains("over");
          console.log(focused);
          if (focused) {
            contentWrapper.elm.scrollTop =
              div.elm.offsetTop + window.scrollY - window.innerHeight / 2 + 100;
            scrolled = true;
          }
        }
        if (!scrolled) {
          contentWrapper.elm.scrollTop = 0;
        }
      }, 50);
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
