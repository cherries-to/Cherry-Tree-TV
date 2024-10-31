import Html from "/libs/html.js";
import { Peer } from "https://esm.sh/peerjs@1.5.4?bundle-deps";
import "/libs/localforage.js";

function animateIn(elm) {
  return new Promise((resolve) => {
    elm.classList.remove("hidden");
    elm.classList.remove("popOut");
    elm.classList.add("popIn");
    setTimeout(() => {
      elm.classList.remove("popIn");
      resolve();
    }, 500);
  });
}
function animateOut(elm) {
  return new Promise((resolve) => {
    elm.classList.remove("popIn");
    elm.classList.add("popOut");
    setTimeout(() => {
      elm.classList.add("hidden");
      elm.classList.remove("popOut");
      resolve();
    }, 500);
  });
}

async function start() {
  // ??
  const panelCode = document.querySelector('[data-ui="code"]');
  const panelRemote = document.querySelector('[data-ui="remote"]');
  const panelKeyboard = document.querySelector('[data-ui="keyboard"]');
  const pcInput = panelCode.querySelector("input");
  const pcPress = panelCode.querySelector("button");
  const bgButton = panelRemote.querySelector("button#bg");
  const pkHeader = panelKeyboard.querySelector("h2");
  const pkParagraph = panelKeyboard.querySelector("p");
  const pkInput = panelKeyboard.querySelector("input");

  let peer = null,
    conn = null,
    custRemoteWrapper = null,
    custRemoteToggle = null;

  const queryString = window.location.search;
  const urlParams = new URLSearchParams(queryString);
  if (urlParams.has("code")) {
    let code = urlParams.get("code");
    pcInput.value = code;
    connect();
  }

  await animateIn(panelCode);

  panelRemote.querySelectorAll("button").forEach((btn) => {
    if (btn.dataset.action === "mic") {
      btn.addEventListener("click", () => {
        alert("Unfortunately, mic is not implemented yet :(");
      });
      return;
    }
    if (btn.dataset.action) {
      btn.addEventListener("click", () => {
        conn.send({
          input: btn.dataset.action,
        });
      });
    }
  });

  async function connect() {
    await animateOut(panelCode);

    peer = new Peer();
    peer.on("open", () => {
      let c = peer.connect(
        "cherry-tree-tv-link-" + pcInput.value.toUpperCase(),
      );

      c.on("open", () => {
        conn = c;
        animateIn(panelRemote);
        conn.send({ canRecvData: true });
      });
      c.on("data", async (d) => {
        if (d.type === "showKeyboard") {
          pkHeader.textContent = d.detail.title;
          pkParagraph.textContent = d.detail.description;

          await animateOut(panelRemote);
          await animateIn(panelKeyboard);

          if (d.detail.type !== undefined) {
            if (d.detail.type === "password") {
              pkInput.type = "password";
            } else {
              pkInput.type = "text";
            }
          } else {
            pkInput.type = "text";
          }

          if (d.detail.value !== undefined) {
            pkInput.value = d.detail.value;
          }

          pkInput.focus();
          pkInput.click();

          pkInput.addEventListener("keyup", async (e) => {
            // if (pkInput.value.trim() === "") {
            //   conn.send({ textInput: "" });
            // }
            if (e.key === "Enter") {
              conn.send({ textInput: pkInput.value, finish: true });
              await animateOut(panelKeyboard);
              await animateIn(panelRemote);
            }
          });
          pkInput.addEventListener("input", (e) => {
            conn.send({ textInput: pkInput.value });
          });
        }
        if (d.type === "registerCustom") {
          console.log(d);
          let wrapperStyles = d.detail.wrapperStyles;
          if (!wrapperStyles) {
            wrapperStyles = {
              position: "absolute",
              top: "0",
              left: "0",
              background: "rgb(0,0,0)",
              width: "100%",
              height: "100%",
            };
          }
          let overrideStyles = {
            background: "rgb(0,0,0)",
            position: "absolute",
            top: "8%",
            left: "0",
            width: "100%",
            height: "92%",
            transition: "all 0.5s cubic-bezier(0.87, 0, 0.13, 1) ",
          };
          let elementsList = Object.keys(d.detail.elements);
          let elements = d.detail.elements;
          custRemoteToggle = new Html("button")
            .text("Hide custom remote")
            .styleJs({
              position: "absolute",
              top: "0",
              left: "0",
              width: "100%",
              maxHeight: "8%",
              height: "8%",
              background: "rgb(25,25,25)",
              borderRadius: "0",
            })
            .appendTo("body");
          let hidden = false;
          custRemoteWrapper = new Html("div")
            .styleJs(wrapperStyles)
            .appendTo("body");
          custRemoteToggle.on("click", () => {
            hidden = !hidden;
            custRemoteWrapper.styleJs({
              zIndex: hidden ? "-1" : "100000",
              maxHeight: hidden ? "0%" : "92%",
              opacity: hidden ? "0" : "1",
            });
            custRemoteToggle.text(`${hidden ? "Show" : "Hide"} custom remote`);
          });
          for (const element of elementsList) {
            console.log("now rendering", elements[element]);
            let elm = new Html(elements[element].type)
              .text(elements[element].text)
              .styleJs(elements[element].style)
              .appendTo(custRemoteWrapper);
            if (elements[element].events) {
              let eventsList = Object.keys(elements[element].events);
              let events = elements[element].events;
              for (const event of eventsList) {
                elm.on(event, (e) => {
                  console.log(event);
                  conn.send({
                    customInput: {
                      eventName: events[event],
                    },
                  });
                });
              }
            }
          }
          custRemoteWrapper.styleJs(overrideStyles);
        }
        if (d.type === "destroyCustom") {
          custRemoteWrapper.cleanup();
          custRemoteToggle.cleanup();
        }
        if (d.type === "changeWallpaper") {
          console.log(d);
          bgButton.style.opacity = 0;
          setTimeout(() => {
            if (d.detail.background === "inherit") {
              bgButton.style.background = "";
            } else {
              bgButton.style.background = d.detail.background;
              bgButton.style.backgroundPosition = "center";
              bgButton.style.backgroundSize = "cover";
            }
          }, 500);
          setTimeout(() => {
            bgButton.style.opacity = 0.3;
          }, 1000);
        }
      });
      c.on("close", () => {
        alert("Connection closed.");
        location.href = `${location.protocol}//${location.host}/link/`;
      });
      c.on("error", (err) => {
        alert("Connection error.\n\n" + err);
        location.href = `${location.protocol}//${location.host}/link/`;
      });
    });
  }

  pcInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      pcPress.click();
    }
  });

  pcPress.addEventListener("click", async () => {
    connect();
  });
}

start();
