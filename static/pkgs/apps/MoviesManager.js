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
      callback,
    ) {
      let options = {
        title,
        description,
        parent: document.body,
        pid: Root.Pid,
        value: parent.dataset.realText || "",
        type: isPassword === true ? "password" : "text",
      };

      let result = (await Root.Libs.Modal.showKeyboard(options)).value;

      if (result.canceled === true) return;

      parent.dataset.realText = result;
      if (isPassword === true) {
        parent.textContent = "•".repeat(result.length);
      } else parent.textContent = result;
      textData[resultName] = result;
      callback;
    }

    async function searchMovie(movieName) {
      const url = `https://api.themoviedb.org/3/search/movie?query=${movieName}&include_adult=true&language=en-US&page=1`;
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
      movieName: null,
      movieDesc: null,
      movieCover: null,
      moviePoster: null,
      movieFile: null,
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

    new Html("h1").text("Add a movie").appendTo(wrapper);
    new Html("p").text("Add a movie to your library.").appendTo(wrapper);
    new Html("h2").text("Search by movie").appendTo(wrapper);
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
      let apiData = await searchMovie(textData["movieName"]);
      console.log(apiData);
      foundList.clear();
      apiData.results.forEach((movie) => {
        console.log(movie);
        let button = new Html("button");
        let img = new Html("img");
        let title = new Html("p");

        let posterPath = `https://image.tmdb.org/t/p/w400${movie.poster_path}`;
        let coverPath = `https://image.tmdb.org/t/p/original${movie.backdrop_path}`;

        title.text(movie.original_title);
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
            movieName.text(movie.original_title);
            responseData.movieName = movie.original_title;
            responseData.movieDesc = movie.overview;
            responseData.movieCover = coverPath;
            responseData.moviePoster = posterPath;
            responseData.nsfw = movie.adult;
            if (!movie.adult) {
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
                `This movie contains NSFW content`,
              );
              cover.styleJs({ opacity: "0", transform: "scale(1.5)" });
            }
          });

        title.styleJs({ textAlign: "center", width: "100%" });
        img.styleJs({ width: "100%" });

        if (movie.adult) {
          img.styleJs({ filter: "blur(20px)" });
        }

        img.appendTo(button);
        title.appendTo(button);
        button.appendTo(foundList);
      });
      Root.Libs.Notify.show(
        "Movies found",
        `Found ${apiData.results.length} results that match "${textData["movieName"]}"`,
      );
      foundInd.styleJs({ display: "block" });
      foundList.styleJs({ display: "flex" });
      UiElems = [row.elm.children, foundList.elm.children, row2.elm.children];
      Ui.init(Pid, "horizontal", UiElems, function (e) {
        if (e === "back") {
          closeSequence();
        }
      });
    }

    let movieName = new Html("button")
      .class("input-box")
      .on("click", (e) => {
        promptForInput(
          "Movie Name",
          "Enter your movie's name",
          e.target,
          false,
          "movieName",
        );
      })
      .appendTo(row);

    new Html("button")
      .text("Search movie")
      .on("click", (e) => {
        searchCallback();
      })
      .appendTo(row);

    let selectedFile = null;

    let foundInd = new Html("h2")
      .text("Found movies")
      .appendTo(wrapper)
      .styleJs({ display: "none" });
    let foundList = new Html("div")
      .class("flex-list")
      .appendTo(wrapper)
      .styleJs({
        display: "none",
      });

    new Html("h2").text("Movie file").appendTo(wrapper);
    let epInd = new Html("p").text("No file selected").appendTo(wrapper);
    const row2 = new Html("div")
      .class("flex-list")
      .appendMany(
        new Html("button").text("Import file").on("click", async (e) => {
          Ui.transition("popOut", wrapper, 500, true);
          await Root.Libs.startPkg(
            "apps:FileManager",
            [
              {
                title: "Choose the movie's file",
                fileSelect: true,
                filterExtensions: ["mp4", "webm", "avi", "mkv"],
                callback: function (arg) {
                  if (!arg.cancelled) {
                    selectedFile = arg.selected;
                    epInd.text(`Selected: ${arg.selected}`);
                  }
                },
              },
            ],
            true,
          );
        }),
        new Html("button").text("Add movie").on("click", async (e) => {
          if (selectedFile == null) {
            await Root.Libs.Modal.Show({
              parent: wrapper,
              pid: Root.Pid,
              title: "Please select a file",
              description: "Please select the file Movies & TV will play.",
              buttons: [
                {
                  type: "primary",
                  text: "OK",
                },
              ],
            });
            return;
          }
          if (responseData.movieName == null) {
            responseData.movieName = textData["movieName"];
            if (responseData.movieName == null) {
              await Root.Libs.Modal.Show({
                parent: wrapper,
                pid: Root.Pid,
                title: "Please choose a name",
                description:
                  "Please choose the name Movies & TV will display for the movie.\n Alternatively, you can search for shows using the Search by Movie feature.",
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
          responseData.movieFile = selectedFile;
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

    UiElems = [row.elm.children, row2.elm.children];

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
