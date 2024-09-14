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

    let UiElems = [];

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
      .attr({ src: launchArgs.moviePoster })
      .styleJs({
        width: "15vw",
        borderRadius: "10px",
      })
      .appendTo(wrapper);

    new Html("h1").text(launchArgs.movieName).appendTo(wrapper);
    new Html("p")
      .text(
        launchArgs.movieDesc
          ? launchArgs.movieDesc
          : "This movie doesn't have an overview.",
      )
      .appendTo(wrapper);

    setTimeout(() => {
      if (!launchArgs.nsfw) {
        cover.attr({ src: launchArgs.movieCover });
        cover.styleJs({ opacity: "1", transform: "scale(1)" });
        document.dispatchEvent(
          new CustomEvent("CherryTree.Ui.ChangeBackground", {
            detail: {
              background: `url(${launchArgs.movieCover})`,
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
    }, 100);
    const row = new Html("div").class("flex-list").appendTo(wrapper);
    new Html("button")
      .text(`Play movie`)
      .appendTo(row)
      .on("click", async () => {
        Ui.transition("popOut", wrapper, 500, true);
        await Root.Libs.startPkg(
          "apps:VideoPlayer",
          [
            {
              app: "video",
              videoPath: launchArgs.movieFile,
              displayName: launchArgs.movieName,
            },
          ],
          true,
        );
      });
    new Html("button")
      .text("Remove movie")
      .on("click", async () => {
        let result = await Root.Libs.Modal.Show({
          parent: wrapper,
          pid: Root.Pid,
          title: "Are you sure you want to remove this movie?",
          description: "This movie will be removed in your library.",
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
