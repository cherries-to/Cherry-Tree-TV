import Html from "/libs/html.js";
import Ws from "/libs/windowSystem.js";
import Keyboard from "/libs/keyboard.js";
import vfs from "/libs/vfs.js";

let wrapper, Ui, Pid, Sfx;

const pkg = {
  name: "Movies & TV",
  type: "app",
  privs: 0,
  start: async function (Root) {
    Pid = Root.Pid;

    Ui = Root.Processes.getService("UiLib").data;

    wrapper = new Html("div").class("ui", "pad-top-sm", "gap").appendTo("body");

    Ui.transition("popIn", wrapper);

    Ui.becomeTopUi(Root.Pid, wrapper);

    Sfx = Root.Processes.getService("SfxLib").data;
    let watchList = {
      movies: [],
      shows: [],
    };

    await vfs.importFS();

    let dataPath = "Root/CherryTree/user/WatchLibrary.json";

    if (await vfs.exists(dataPath)) {
      watchList = JSON.parse(await vfs.readFile(dataPath));
    } else {
      await vfs.writeFile(dataPath, JSON.stringify(watchList));
    }

    console.log(watchList);

    new Html("h1").text("Movies & TV").appendTo(wrapper);
    new Html("p")
      .text("Watch movies and shows stored on this TV")
      .appendTo(wrapper);

    // const row = new Html("div").class("flex-list").appendTo(wrapper);

    new Html("h2").text("Movies").appendTo(wrapper);

    const row1 = new Html("div").class("flex-list").appendTo(wrapper);
    let noMovies = new Html("button")
      .text("No movies have been added")
      .appendTo(row1);

    new Html("h2").text("Shows").appendTo(wrapper);
    const row2 = new Html("div").class("flex-list").appendTo(wrapper);
    let noShows = new Html("button")
      .text("No shows have been added")
      .appendTo(row2);

    new Html("h2").text("Add...").appendTo(wrapper);
    const row3 = new Html("div").class("flex-list").appendTo(wrapper);

    // Function to update the movies list
    async function updateMovieList() {
      row1.clear();

      if (watchList.movies.length === 0) {
        noMovies = new Html("button")
          .text("No movies have been added")
          .appendTo(row1);
      } else {
        watchList.movies.forEach((movie, index) => {
          createMovieButton(movie, index).appendTo(row1);
        });
      }

      Ui.init(
        Root.Pid,
        "horizontal",
        [row1.elm.children, row2.elm.children, row3.elm.children],
        function (e) {
          if (e === "back") {
            Root.end();
          }
        }
      );
    }

    // Function to update the shows list
    async function updateShowList() {
      row2.clear();

      if (watchList.shows.length === 0) {
        noShows = new Html("button")
          .text("No shows have been added")
          .appendTo(row2);
      } else {
        watchList.shows.forEach((show, index) => {
          createShowButton(show, index).appendTo(row2);
        });
      }

      Ui.init(
        Root.Pid,
        "horizontal",
        [row1.elm.children, row2.elm.children, row3.elm.children],
        function (e) {
          if (e === "back") {
            Root.end();
          }
        }
      );
    }

    function createMovieButton(movie, index) {
      let button = new Html("button");
      let img = new Html("img");
      let title = new Html("p");

      title.text(movie.movieName);
      img.attr({ src: movie.moviePoster });

      button
        .styleJs({
          display: "flex",
          flexDirection: "column",
          width: "40px",
          height: "100%",
          gap: "10px",
        })
        .on("click", async (e) => {
          Ui.transition("popOut", wrapper, 500, true);
          await Root.Libs.startPkg(
            "apps:MovieViewer",
            [
              movie,
              {
                callback: async function (remove) {
                  if (remove) {
                    watchList.movies.splice(index, 1);
                    await vfs.writeFile(dataPath, JSON.stringify(watchList));
                    button.cleanup();
                    updateMovieList();
                  }
                },
              },
            ],
            true
          );
        });

      title.styleJs({ textAlign: "center", width: "100%" });
      img.styleJs({ width: "100%" });

      img.appendTo(button);
      title.appendTo(button);
      return button;
    }

    function createShowButton(show, index) {
      let button = new Html("button");
      let img = new Html("img");
      let title = new Html("p");

      title.text(show.showName);
      img.attr({ src: show.showPoster });

      button
        .styleJs({
          display: "flex",
          flexDirection: "column",
          width: "40px",
          height: "100%",
          gap: "10px",
        })
        .on("click", async (e) => {
          Ui.transition("popOut", wrapper, 500, true);
          await Root.Libs.startPkg(
            "apps:ShowViewer",
            [
              show,
              {
                callback: async function (remove) {
                  if (remove) {
                    watchList.shows.splice(index, 1);
                    await vfs.writeFile(dataPath, JSON.stringify(watchList));
                    button.cleanup();
                    updateShowList();
                  }
                },
              },
            ],
            true
          );
        });

      title.styleJs({ textAlign: "center", width: "100%" });
      img.styleJs({ width: "100%" });

      img.appendTo(button);
      title.appendTo(button);
      return button;
    }

    async function movieCreated(data) {
      if (data.cancelled) {
        return;
      }
      console.log(data);
      watchList.movies.push(data);
      await vfs.writeFile(dataPath, JSON.stringify(watchList));
      updateMovieList();

      setTimeout(async () => {
        await Root.Libs.Modal.Show({
          parent: wrapper,
          pid: Root.Pid,
          title: "Movie added",
          description: `${data.movieName} has been added to your library.`,
          buttons: [
            {
              type: "primary",
              text: "OK",
            },
          ],
        });
      }, 500);
    }

    async function showCreated(data) {
      if (data.cancelled) {
        return;
      }
      console.log(data);
      watchList.shows.push(data);
      await vfs.writeFile(dataPath, JSON.stringify(watchList));
      updateShowList();

      setTimeout(async () => {
        await Root.Libs.Modal.Show({
          parent: wrapper,
          pid: Root.Pid,
          title: "Show added",
          description: `${data.showName} has been added to your library.`,
          buttons: [
            {
              type: "primary",
              text: "OK",
            },
          ],
        });
      }, 500);
    }

    updateMovieList();
    updateShowList();

    row3.appendMany(
      new Html("button").text("Add movies").on("click", async (e) => {
        Ui.transition("popOut", wrapper, 500, true);
        await Root.Libs.startPkg(
          "apps:MoviesManager",
          [{ callback: movieCreated }],
          true
        );
      }),
      new Html("button").text("Add shows").on("click", async (e) => {
        Ui.transition("popOut", wrapper, 500, true);
        await Root.Libs.startPkg(
          "apps:ShowsManager",
          [{ callback: showCreated }],
          true
        );
      })
    );

    Ui.init(
      Root.Pid,
      "horizontal",
      [row1.elm.children, row2.elm.children, row3.elm.children],
      function (e) {
        if (e === "back") {
          Root.end();
        }
      }
    );
  },
  end: async function () {
    Ui.cleanup(Pid);
    Sfx.playSfx("deck_ui_out_of_game_detail.wav");
    Ui.giveUpUi(Pid);
    wrapper.cleanup();
  },
};

export default pkg;
