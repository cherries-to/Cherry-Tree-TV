import Html from "/libs/html.js";
import { Peer } from "https://esm.sh/peerjs@1.5.4?bundle-deps";

let wrapper,
  row,
  Ui,
  Pid,
  Sfx,
  peer,
  call,
  conn,
  socket,
  connectionState,
  negotiatedType,
  isDisplayed,
  video;

const pkg = {
  name: "Casting",
  type: "app",
  privs: 0,
  start: async function (Root) {
    Pid = Root.Pid;

    Ui = Root.Processes.getService("UiLib").data;

    wrapper = new Html("div")
      .class("full-ui")
      .styleJs({
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: "10px",
      })
      .appendTo("body");

    Ui.transition("popIn", wrapper);

    Ui.becomeTopUi(Pid, wrapper);

    Sfx = Root.Processes.getService("SfxLib").data;

    Sfx.playSfx("deck_ui_into_game_detail.wav");

    const Background = Root.Processes.getService("Background").data;
    const tvName = Root.Security.getSecureVariable("TV_NAME");
    connectionState = "ready";
    isDisplayed = false;

    console.log(Sfx);

    function setupCasting(onReady) {
      socket = io("https://olive.nxw.pw:4190", {
        query: {
          name: tvName,
          system: `Cherry Tree TV`,
        },
      });
      socket.on("info", (info) => {
        console.log("Device info", info);
        peer = new Peer(info.peerID);
        peer.on("open", (id) => {
          console.log(peer);
          socket.emit("ready");
          onReady();
        });
        peer.on("connection", (curConn) => {
          console.log("New connection");
          conn = curConn;
          conn.on("data", (data) => {
            console.log("Received", data);
            let transferType = data.type;
            if (transferType == "negotiate") {
              negotiatedType = data.share;
              console.log(`Device will be sharing their ${negotiatedType}`);
              conn.send({ type: "shareReady" });
            }
            if (transferType == "shareReady") {
              console.log("Share ready");
            }
            if (transferType == "streamEnded") {
              console.log("Stream ended");
              video.elm.removeAttribute("src");
              video.elm.remove();
              connectionState = "ready";
              isDisplayed = false;
            }
          });
          peer.on("call", (curCall) => {
            call = curCall;
            if (!negotiatedType) {
              conn.send({
                type: "decline",
                message: "Client did not negotiate",
              });
              return;
            }
            if (negotiatedType != "screen") {
              conn.send({
                type: "decline",
                message: "Negotiation mismatch",
              });
              return;
            }
            if (connectionState != "ready") {
              conn.send({
                type: "decline",
                message: `Client is currently ${connectionState}`,
              });
              return;
            }
            console.log(call.peer);
            call.answer();
            call.on("stream", (curStream) => {
              if (isDisplayed) {
                console.log("Duplicate video element - returning");
                return;
              }
              connectionState = "receiving";
              video = new Html("video")
                .styleJs({
                  position: "absolute",
                  top: "0",
                  left: "0",
                  width: "100%",
                  height: "100%",
                  zIndex: 10000000,
                  objectFit: "contain",
                })
                .appendTo("body");
              video.elm.srcObject = curStream;
              video.elm.controls = true;
              video.elm.muted = false;
              video.elm.play();
              isDisplayed = true;
              const track = curStream.getVideoTracks()[0];
              console.log(track);
            });
            call.on("close", () => {
              video.elm.removeAttribute("src");
              video.elm.remove();
            });
            call.on("disconnect", () => {
              video.elm.removeAttribute("src");
              video.elm.remove();
            });
          });
        });
      });
    }

    new Html("h1").text("Loading...").appendTo(wrapper);

    setupCasting(() => {
      wrapper.clear();
      new Html("p").text("This TV is ready to project as:").appendTo(wrapper);
      new Html("h1").text(tvName).appendTo(wrapper);
      new Html("p")
        .html(
          `Open PlutoCast on a supported device and find <strong>${tvName}.</strong>`,
        )
        .appendTo(wrapper);
      new Html("br").appendTo(wrapper);
      row = new Html("div")
        .class("flex-list")
        .appendMany(
          new Html("button").text("Exit app").on("click", (e) => {
            Root.end();
          }),
        )
        .appendTo(wrapper);

      Ui.init(Pid, "horizontal", [row.elm.children], function (e) {
        if (e === "back") {
          pkg.end();
        }
      });
    });
  },
  end: async function () {
    if (video) {
      video.elm.remove();
    }
    if (peer) {
      peer.destroy();
    }
    if (socket) {
      socket.disconnect();
    }
    Ui.cleanup(Pid);
    Sfx.playSfx("deck_ui_out_of_game_detail.wav");
    // await Ui.transition("popOut", wrapper);
    Ui.giveUpUi(Pid);
    wrapper.cleanup();
  },
};

export default pkg;
