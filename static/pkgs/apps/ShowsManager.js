import Html from "/libs/html.js";
import Keyboard from "/libs/keyboard.js";
import vfs from "/libs/vfs.js";

let wrapper, Ui, Pid, Sfx;

const pkg = {
  name: "Show Manager",
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

    console.log(Sfx);

    await vfs.importFS();

    let textData = {};

    async function promptForInput(
      title,
      description,
      parent,
      isPassword = false,
      resultName,
    ) {
      let options = {
        title,
        description,
        parent: document.body,
        pid: Root.Pid,
        value: parent.dataset.realText || "",
        type: isPassword === true ? "password" : "text",
      };

      let result = await Root.Libs.Modal.showKeyboard(options);

      if (result.canceled === true) return;

      parent.dataset.realText = result.value;
      if (isPassword === true) {
        parent.textContent = "•".repeat(result.length);
      } else parent.textContent = result.value;
      textData[resultName] = result.value;
    }

    async function searchShow(showName) {
      const url = `https://api.themoviedb.org/3/search/tv?query=${showName}&include_adult=true&language=en-US&page=1`;
      const options = {
        method: "GET",
        headers: {
          accept: "application/json",
          Authorization:
            "Bearer eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiJjMTEyOTc4MmE1YzJkMDZiMTZlNzY2ZWNiZWI4YWQwYSIsInN1YiI6IjY2NmVhNTM3ODI2NmE0OTI5MzdkYThmZiIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.0Aal5Q-47-94FIRmNLY932jZfzqrWdVn6agFCwYqUuc",
        },
      };

      return new Promise((resolve, reject) => {
        fetch(url, options)
          .then((res) => res.json())
          .then((json) => resolve(json))
          .catch((err) => reject("error:" + err));
      });
    }

    let responseData = {
      cancelled: true,
      season: null,
      showName: null,
      showDesc: null,
      showCover: null,
      showPoster: null,
      showFolder: null,
      nsfw: false,
    };

    async function closeSequence() {
      let result = await Root.Libs.Modal.Show({
        parent: wrapper,
        pid: Root.Pid,
        title: "Are you sure you want to exit?",
        description: "Your progress will be lost.",
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
        if (launchArgs.callback) {
          launchArgs.callback(responseData);
        }
        document.dispatchEvent(
          new CustomEvent("CherryTree.Ui.ChangeBackground", {
            detail: {
              background: `inherit`,
            },
          }),
        );
        pkg.end();
      }
    }

    let UiElems = [];
    let launchArgs = Root.Arguments !== undefined ? Root.Arguments[0] : {};

    new Html("h1").text("Add a show").appendTo(wrapper);
    new Html("p").text("Add a show to your library.").appendTo(wrapper);
    new Html("h2").text("Search by show").appendTo(wrapper);
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
    const row = new Html("div").class("flex-list").appendTo(wrapper);

    async function searchCallback() {
      let apiData = await searchShow(textData["showName"]);
      console.log(apiData);
      foundList.clear();
      apiData.results.forEach((show) => {
        console.log(show);
        let button = new Html("button");
        let img = new Html("img");
        let title = new Html("p");

        let posterPath = `https://image.tmdb.org/t/p/w400${show.poster_path}`;
        let coverPath = `https://image.tmdb.org/t/p/original${show.backdrop_path}`;

        title.text(show.name);
        img.attr({ src: posterPath });

        button
          .styleJs({
            display: "flex",
            flexDirection: "column",
            width: "40px",
            height: "100%",
            gap: "10px",
          })
          .on("click", () => {
            showName.text(show.name);
            responseData.showName = show.name;
            responseData.showDesc = show.overview;
            responseData.showCover = coverPath;
            responseData.showPoster = posterPath;
            responseData.nsfw = show.adult;
            if (!show.adult) {
              cover.attr({ src: coverPath });
              cover.styleJs({ opacity: "1", transform: "scale(1)" });
              document.dispatchEvent(
                new CustomEvent("CherryTree.Ui.ChangeBackground", {
                  detail: {
                    background: `url(${coverPath})`,
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
          });

        title.styleJs({ textAlign: "center", width: "100%" });
        img.styleJs({ width: "100%" });

        if (show.adult) {
          img.styleJs({ filter: "blur(20px)" });
        }

        img.appendTo(button);
        title.appendTo(button);
        button.appendTo(foundList);
      });
      Root.Libs.Notify.show(
        "Shows found",
        `Found ${apiData.results.length} results that match "${textData["showName"]}"`,
      );
      foundInd.styleJs({ display: "block" });
      foundList.styleJs({ display: "flex" });
      UiElems = [
        row.elm.children,
        row2.elm.children,
        foundList.elm.children,
        row3.elm.children,
      ];
      Ui.init(Pid, "horizontal", UiElems, function (e) {
        if (e === "back") {
          closeSequence();
        }
      });
    }

    let showName = new Html("button")
      .class("input-box")
      .on("click", (e) => {
        promptForInput(
          "Show Name",
          "Enter your show's name",
          e.target,
          false,
          "showName",
        );
      })
      .appendTo(row);

    new Html("button")
      .text("Search show")
      .on("click", (e) => {
        searchCallback();
      })
      .appendTo(row);

    let selectedFolder = null;
    const row2 = new Html("div").class("flex-list").appendTo(wrapper);
    new Html("button")
      .class("input-box")
      .text("Season...")
      .on("click", (e) => {
        promptForInput(
          "Season",
          "Enter your show's season",
          e.target,
          false,
          "showSeason",
        );
      })
      .appendTo(row2);

    let foundInd = new Html("h2")
      .text("Found shows")
      .appendTo(wrapper)
      .styleJs({ display: "none" });
    let foundList = new Html("div")
      .class("flex-list")
      .appendTo(wrapper)
      .styleJs({
        display: "none",
      });

    new Html("h2").text("Episodes").appendTo(wrapper);
    let epInd = new Html("p").text("No folder selected").appendTo(wrapper);
    const row3 = new Html("div")
      .class("flex-list")
      .appendMany(
        new Html("button").text("Import from folder").on("click", async (e) => {
          Ui.transition("popOut", wrapper, 500, true);
          await Root.Libs.startPkg(
            "apps:FileManager",
            [
              {
                title: "Choose a folder where the show is stored",
                folderSelect: true,
                callback: function (arg) {
                  if (!arg.cancelled) {
                    selectedFolder = arg.selected;
                    epInd.text(`Selected: ${arg.selected}`);
                  }
                },
              },
            ],
            true,
          );
        }),
        new Html("button").text("Add show").on("click", async (e) => {
          if (selectedFolder == null) {
            await Root.Libs.Modal.Show({
              parent: wrapper,
              pid: Root.Pid,
              title: "Please select a folder",
              description:
                "Please select where Movies & TV will grab the show.",
              buttons: [
                {
                  type: "primary",
                  text: "OK",
                },
              ],
            });
            return;
          }
          if (responseData.showName == null) {
            responseData.showName = textData["showName"];
            if (responseData.showName == null) {
              await Root.Libs.Modal.Show({
                parent: wrapper,
                pid: Root.Pid,
                title: "Please choose a name",
                description:
                  "Please choose the name Movies & TV will display for the show.\n Alternatively, you can search for shows using the Search by Show feature.",
                buttons: [
                  {
                    type: "primary",
                    text: "OK",
                  },
                ],
              });
            }
            return;
          }
          if (responseData.season == null) {
            responseData.season = textData["showSeason"];
            if (responseData.season == null) {
              responseData.season = 1;
            }
          }
          responseData.showFolder = selectedFolder;
          responseData.cancelled = false;
          if (launchArgs.callback) {
            launchArgs.callback(responseData);
            cover.styleJs({ opacity: "0", transform: "scale(1.5)" });
            setTimeout(() => {
              cover.cleanup();
            }, 500);
            pkg.end();
          }
        }),
      )
      .appendTo(wrapper);

    UiElems = [row.elm.children, row2.elm.children, row3.elm.children];

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
