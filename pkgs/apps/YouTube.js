import Html from "/libs/html.js";

let wrapper, Ui, Pid, Sfx;

const pkg = {
  name: "GamepadRemapping",
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

    const audio = Sfx.getAudio();

    const topBar = new Html("div").appendTo(wrapper);

    const row = new Html("div")
      .class("flex-list")
      .styleJs({
        overflow: "auto",
        // "align-items": "flex-end",
        width: "100%",
        // "min-height": "300px",
      })
      .appendTo(wrapper);

    let title = new Html("h1")
      .text("Early Alpha Youtube Client")
      .appendTo(topBar);

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
        // temporary player

        audio.pause();

        Ui.transition("popOut", wrapper);
        let player = new Html("iframe")
          .attr({
            src: `https://youtube.com/embed/${i.id}?autoplay=1`,
          })
          .style({
            height: "100%",
            width: "100%",
          })
          .appendTo(wrapper);
        player.on("load", () => {
          Ui.transition("popIn", wrapper);
        });
      });
      thumbnailWrapper.appendTo(row);
      Ui.transition("popIn", thumbnailWrapper);
    });

    console.log(row);

    Ui.init(
      Pid,
      "horizontal",
      [topBar.elm.children, row.elm.children],
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
    Ui.giveUpUi(Pid);
    wrapper.cleanup();
  },
};

export default pkg;
