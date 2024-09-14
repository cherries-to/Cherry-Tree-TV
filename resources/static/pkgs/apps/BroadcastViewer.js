import Html from "/libs/html.js";
import { ParseM3U } from "../../libs/iptv-parser.min.js";

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

    async function getFile(path) {
      const result = await fetch(
        "http://127.0.0.1:9864/getFile?path=" + encodeURIComponent(path),
      )
        .then((t) => t.text())
        .catch((_) => undefined);
      return result;
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

    function searchBroadcast(broadcastName) {
      return new Promise((resolve, reject) => {
        const url = `https://api.themoviedb.org/3/search/multi?query=${broadcastName}&include_adult=true&language=en-US&page=1`;
        const options = {
          method: "GET",
          headers: {
            accept: "application/json",
            Authorization:
              "Bearer eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiJjMTEyOTc4MmE1YzJkMDZiMTZlNzY2ZWNiZWI4YWQwYSIsInN1YiI6IjY2NmVhNTM3ODI2NmE0OTI5MzdkYThmZiIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.0Aal5Q-47-94FIRmNLY932jZfzqrWdVn6agFCwYqUuc",
          },
        };

        fetch(url, options)
          .then((res) => res.json())
          .then((json) => {
            let results = [];
            if (json) {
              results = json.results.filter((result) => {
                if (
                  result.media_type !== "tv" &&
                  result.media_type !== "movie"
                ) {
                  return false;
                } else return true;
              });
            }
            return results;
          })
          .then((results) => {
            resolve(results);
          })
          .catch((err) => reject("error:" + err));
      });
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
      .attr({ src: launchArgs.broadcastPoster })
      .styleJs({
        width: "15vw",
        borderRadius: "10px",
      })
      .appendTo(wrapper);

    new Html("h1").text(launchArgs.broadcastName).appendTo(wrapper);

    setTimeout(() => {
      if (!launchArgs.nsfw) {
        cover.attr({ src: launchArgs.broadcastCover });
        cover.styleJs({ opacity: "1", transform: "scale(1)" });
        document.dispatchEvent(
          new CustomEvent("CherryTree.Ui.ChangeBackground", {
            detail: {
              background: `url(${launchArgs.broadcastCover})`,
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

    let buttons = [];
    async function renderBroadcastList() {
      buttons.forEach((button) => {
        button.cleanup();
        let index = UiElems.indexOf(button);
        UiElems.splice(index, 1);
      });

      buttons = [];

      console.log("Broadcast info:", launchArgs);

      let file;

      if (launchArgs.broadcastIsFile) {
        file = await getFile(launchArgs.broadcastLink);
      } else {
        file = await fetch(launchArgs.broadcastLink).then((t) => t.text());
      }

      const data = await ParseM3U(file);

      if (!data.items) {
        new Html("div")
          .class("flex-list")
          .append(
            new Html("span").text("Unable to retrieve broadcast listing."),
          )
          .appendTo(wrapper)
          .styleJs({ width: "100%" });
        return;
      }

      console.log("Broadcast list:", data);

      console.log(file);

      data.items.forEach((item) => {
        let re = /(?:\.([^.]+))?$/;
        let ext = re.exec(item.name)[1];
        console.log(ext);
        console.log(item);
        let row = new Html("div")
          .class("flex-list")
          .appendTo(wrapper)
          .styleJs({ width: "100%" });
        let showPreview = new Html("img")
          .styleJs({
            aspectRatio: "16 / 9",
            height: "85%",
            borderRadius: "5px",
          })
          .attr({
            "data-src": "/assets/img/broadcast_no_poster.svg",
            class: "lazyload",
          });
        let showCountName = new Html("div").styleJs({
          display: "flex",
          flexDirection: "column",
          gap: "5px",
          width: "50%",
        });
        new Html("p")
          .text(item.name.replace(/\.[^/.]+$/, ""))
          .appendTo(showCountName)
          .styleJs({ textAlign: "left" });
        new Html("button")
          .appendMany(showPreview, showCountName)
          .styleJs({
            width: "100%",
            height: "200px",
            display: "flex",
            gap: "15px",
            alignItems: "center",
            justifyContent: "center",
          })
          .appendTo(row)
          .on("click", async () => {
            console.log(item);
            Ui.transition("popOut", wrapper, 500, true);
            await Root.Libs.startPkg(
              "apps:BroadcastPlayer",
              [
                {
                  app: "broadcast",
                  videoPath: item.url,
                  displayName: item.name,
                },
              ],
              true,
            );
          });
        UiElems.push(row.elm.children);
        buttons.push(row);
        Ui.init(Pid, "horizontal", UiElems, function (e) {
          if (e === "back") {
            closeSequence();
          }
        });
      });
    }
    const row = new Html("div").class("flex-list").appendTo(wrapper);
    new Html("button")
      .text("Remove broadcast")
      .on("click", async () => {
        let result = await Root.Libs.Modal.Show({
          parent: wrapper,
          pid: Root.Pid,
          title: "Are you sure you want to remove this broadcast?",
          description: "This broadcast will be removed from your library.",
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
    renderBroadcastList();

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
