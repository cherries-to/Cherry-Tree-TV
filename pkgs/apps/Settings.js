import Html from "/libs/html.js";
import Ws from "/libs/windowSystem.js";
import Keyboard from "/libs/keyboard.js";

let wrapper, Ui, Pid, Sfx;

const pkg = {
  name: "Settings",
  type: "app",
  privs: 0,
  start: async function (Root) {
    Pid = Root.Pid;

    Ui = Root.Processes.getService("UiLib").data;
    let Users = Root.Processes.getService("UserSvc").data;

    wrapper = new Html("div").class("ui", "pad-top", "gap").appendTo("body");

    Ui.transition("popIn", wrapper);

    Ui.becomeTopUi(Root.Pid, wrapper);

    Sfx = Root.Processes.getService("SfxLib").data;

    const Background = Root.Processes.getService("Background").data;
    console.log(Sfx);

    new Html("h1").text("Settings").appendTo(wrapper);
    new Html("p").text("Modify and change settings.").appendTo(wrapper);

    new Html("h2").text("Setup").appendTo(wrapper);
    new Html("p")
      .text("Configure account settings and setup.")
      .appendTo(wrapper);
    const row0 = new Html("div").class("flex-list").appendTo(wrapper);

    row0.appendMany(
      new Html("button")
        .text("Retrieve User Information")
        .on("click", async (e) => {
          await Ui.giveUpUi(Root.Pid, true);

          await Root.Libs.Modal.showWithoutButtons(
            "Loading",
            "Downloading user data...",
            wrapper,
            Root.Pid,
            async function (a) {
              let info = await Users.getUserInfo(
                await Root.Security.getToken()
              );
              a();
              setTimeout(() => {
                Root.Libs.Modal.Show({
                  parent: wrapper,
                  pid: Root.Pid,
                  title: "User Info",
                  description: JSON.stringify(info, null, 4),
                  buttons: [
                    {
                      type: "primary",
                      text: "OK",
                    },
                  ],
                });
              }, 500);
            }
          );
        }),
      new Html("button")
        .text("Log out of your account")
        .on("click", async (e) => {
          // Delegate UI while loading the app
          let result = await Root.Libs.Modal.Show({
            parent: wrapper,
            pid: Root.Pid,
            title: "Are you sure you want to log out?",
            description: "You will have to log in again.",
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

          // Delegate UI while loading the app
          // Ui.transition("popOut", wrapper, 500, true);
          // await Root.Libs.startPkg("system:Oobe", [], true);
        }),
      new Html("button").text("Delete ALL Data").on("click", async (e) => {
        // Delegate UI while loading the app
        let result = await Root.Libs.Modal.Show({
          parent: wrapper,
          pid: Root.Pid,
          title: "Are you sure you want to do this?",
          description:
            "This will delete EVERYTHING. Your saved user account data and settings will be deleted permanently.",
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

        if (result.id === 1) {
          await localforage.setItem("fs", null);
          location.reload();
        }
      })
    );

    new Html("h2").text("Input").appendTo(wrapper);
    new Html("p").text("Configure input methods.").appendTo(wrapper);

    let phoneLinkStatus = new Html("p")
      .html(`Phone Link code:&nbsp;`)
      .append(new Html("strong").text(window.phoneLinkCode))
      .appendTo(wrapper);

    let qr = new Html("img")
      .styleJs({
        borderRadius: "5px",
        width: "20%",
      })
      .appendTo(phoneLinkStatus);

    function showTvLinkCode() {
      phoneLinkStatus.style({ display: "block" });

      phoneLinkStatus.elm.querySelector("strong").textContent =
        window.phoneLinkCode;

      fetch("http://localhost:9864/local_ip")
        .then((res) => res.text())
        .then((ip) => {
          qr.attr({
            src: `${location.protocol}//${location.hostname}:9864/qr?url=${location.protocol}//${ip}:${location.port}/link/index.html?code=${window.phoneLinkCode}`,
          });
        });
    }
    function hideTvLinkCode() {
      phoneLinkStatus.style({ display: "none" });
    }

    // events
    document.addEventListener("CherryTree.Input.EnableTvRemote", () => {
      showTvLinkCode();
    });
    document.addEventListener("CherryTree.Input.DisableTvRemote", () => {
      hideTvLinkCode();
    });

    if ((await localforage.getItem("settings__phoneLink")) === true) {
      showTvLinkCode();
    } else {
      hideTvLinkCode();
    }

    const row1 = new Html("div").class("flex-list").appendTo(wrapper);

    row1.appendMany(
      new Html("button")
        .text("Enable/Disable Phone Link")
        .on("click", async (e) => {
          let remoteLinkState = await localforage.getItem(
            "settings__phoneLink"
          );

          const result = await Root.Libs.Modal.Show({
            parent: wrapper,
            pid: Root.Pid,
            title: "Phone Link Settings",
            description:
              "Phone Link is currently " +
              (remoteLinkState === true ? "enabled" : "disabled") +
              ".",
            buttons: [
              {
                type: "primary",
                text: "On",
              },
              {
                type: "primary",
                text: "Off",
              },
            ],
          });

          if (result.id === 0) {
            // enable
            document.dispatchEvent(
              new CustomEvent("CherryTree.Input.EnableTvRemote")
            );
          } else if (result.id === 1) {
            // disable
            document.dispatchEvent(
              new CustomEvent("CherryTree.Input.DisableTvRemote")
            );
          }

          // Ui.transition("popOut", wrapper, 500, true);
          // await Root.Libs.startPkg("apps:ControllerRemapping", [], true);
        }),
    );

    new Html("h2").text("Display").appendTo(wrapper);
    new Html("p")
      .text("Configure visual and accessibility settings.")
      .appendTo(wrapper);
    const row2 = new Html("div").class("flex-list").appendTo(wrapper);

    row2.appendMany(
      new Html("button").text("UI scaling").on("click", async (e) => {
        let getScaleValue = Ui.scaling.getScaleValue;

        let values = [
          {
            label: "60%",
            scale: getScaleValue(60),
          },
          {
            label: "70%",
            scale: getScaleValue(70),
          },
          {
            label: "85%",
            scale: getScaleValue(85),
          },
          {
            label: "100%",
            scale: "16px",
          },
          {
            label: "125%",
            scale: getScaleValue(125),
          },
          {
            label: "150%",
            scale: getScaleValue(150),
          },
          {
            label: "175%",
            scale: getScaleValue(175),
          },
          {
            label: "200%",
            scale: getScaleValue(200),
          },
        ];

        const result = await Root.Libs.Modal.Show({
          parent: wrapper,
          pid: Root.Pid,
          title: "Configure UI scaling",
          description: "Select the zoom level",
          buttons: values.map((m) => {
            return {
              type: "primary",
              text: m.label,
            };
          }),
        });

        if (result.canceled === true) return;
        document.documentElement.style.fontSize = values[result.id].scale;
        await localforage.setItem("settings__uiScale", values[result.id].scale);
      }),
      new Html("button").text("Background").on("click", async (e) => {
        const result = await Root.Libs.Modal.Show({
          parent: wrapper,
          pid: Root.Pid,
          title: "Configure background",
          description: "Select the background type you prefer.",
          buttons: [
            {
              type: "primary",
              text: "Basic",
            },
            {
              type: "primary",
              text: "Space",
            },
          ],
        });

        if (result.canceled === true) return;

        const value = result.id === 1 ? true : false;

        await Background.toggle(value);

        await localforage.setItem(
          "settings__backgroundType",
          value === true ? "stars" : "none"
        );
      })
    );

    new Html("h2").text("Audio").appendTo(wrapper);
    new Html("p").text("Configure audio-related settings.").appendTo(wrapper);
    const row3 = new Html("div").class("flex-list").appendTo(wrapper);

    row3.appendMany(
      new Html("button").text("Change system volume").on("click", async (e) => {
        let ContainerDiv = new Html("div").class("flex-col");

        let inputBox = new Html("div")
          .class("input")
          .attr({ type: "text" })
          .appendTo(ContainerDiv);

        let cb;

        function handleInput(e) {
          inputBox.elm.textContent += e.target.textContent;
        }

        // input list
        new Html("div")
          .appendTo(ContainerDiv)
          .class("flex-col", "buttons")
          .appendMany(
            new Html("div").class("flex-row").appendMany(
              new Html("button").text("1").on("click", (e) => handleInput(e)),
              new Html("button").text("2").on("click", (e) => handleInput(e)),
              new Html("button").text("3").on("click", (e) => handleInput(e))
            ),
            new Html("div").class("flex-row").appendMany(
              new Html("button").text("4").on("click", (e) => handleInput(e)),
              new Html("button").text("5").on("click", (e) => handleInput(e)),
              new Html("button").text("6").on("click", (e) => handleInput(e))
            ),
            new Html("div").class("flex-row").appendMany(
              new Html("button").text("7").on("click", (e) => handleInput(e)),
              new Html("button").text("8").on("click", (e) => handleInput(e)),
              new Html("button").text("9").on("click", (e) => handleInput(e))
            ),
            new Html("div").class("flex-row").appendMany(
              new Html("button")
                .html("&larr;")
                .on(
                  "click",
                  (e) =>
                    (inputBox.elm.textContent =
                      inputBox.elm.textContent.substring(
                        0,
                        inputBox.elm.textContent.length - 1
                      ))
                ),
              new Html("button").text("0").on("click", (e) => handleInput(e)),
              new Html("button").text("Confirm").on("click", (e) =>
                cb({
                  canceled: false,
                  text: inputBox.elm.textContent,
                  id: -1,
                })
              )
            )
          );

        const result = await Root.Libs.Modal.Show({
          parent: wrapper,
          pid: Root.Pid,
          title: "Volume level",
          description: "Set the main volume level for the system (0-100%)",
          type: "custom",
          customSfx: {
            hover: "deck_ui_navigation.wav",
            activate: "deck_ui_typing.wav",
          },
          customData: ContainerDiv,
          customType: "slider",
          dataHandler: function (clb) {
            // Callback the callback
            cb = clb;
          },
        });

        Sfx.setVolume(parseInt(inputBox.elm.textContent) / 100);
        await localforage.setItem(
          "settings__soundVolume",
          inputBox.elm.textContent
        );

        // await Root.Libs.Modal.Show({
        //   parent: wrapper,
        //   pid: Root.Pid,
        //   title: "Result",
        //   description: `You typed:\n\n${inputBox.elm.textContent}`,
        //   buttons: [
        //     {
        //       type: "primary",
        //       text: "OK",
        //     },
        //   ],
        // });
      }),
      new Html("button")
        .text("Sound effects settings")
        .on("click", async (e) => {
          let sfxPack = await localforage.getItem("settings__sfxPack");

          async function promptDone() {
            await Root.Libs.Modal.Show({
              parent: wrapper,
              pid: Root.Pid,
              title: "Completed",
              description: "Your new sound effect pack has been applied.",
              buttons: [
                {
                  type: "primary",
                  text: "OK",
                },
              ],
            });
          }

          const menuResult = await Root.Libs.Modal.Show({
            parent: wrapper,
            pid: Root.Pid,
            title: "Configure sounds",
            description: "Which setting would you like to configure?",
            buttons: [
              {
                type: "primary",
                text: "Change sound pack",
              },
            ],
          });

          if (menuResult.canceled === true) return;
          if (menuResult.id === 0) {
            const result = await Root.Libs.Modal.Show({
              parent: wrapper,
              pid: Root.Pid,
              title: "Configure sound effects",
              description: "Select the sound pack to be used.",
              buttons: [
                {
                  type: "primary",
                  text: "Dreamy SFX (default)",
                },
                {
                  type: "primary",
                  text: "Steam Deck",
                },
                {
                  type: "primary",
                  text: "round sounds (cadecomposer)",
                },
                {
                  type: "primary",
                  text: "Material Sounds (NoctenUI)",
                },
                {
                  type: "primary",
                  text: "PS Sounds (PS5)",
                },
              ],
            });

            if (result.canceled === true) return;

            switch (result.id) {
              case 0:
                sfxPack = "/assets/audio/sfx_dreamy.zip";
                break;
              case 1:
                sfxPack = "/assets/audio/sfx_deck.zip";
                break;
              case 2:
                sfxPack = "/assets/audio/sfx_floating.zip";
                break;
              case 3:
                sfxPack = "/assets/audio/sfx_nocturn.zip";
                break;
              case 4:
                sfxPack = "/assets/audio/sfx_ps.zip";
                break;
            }

            await localforage.setItem("settings__sfxPack", sfxPack);

            let A;

            await Root.Libs.Modal.showWithoutButtons(
              "Loading",
              "Downloading content...",
              wrapper,
              Root.Pid,
              function (a) {
                A = a;
              }
            );

            await Sfx.init(sfxPack);
            await A();

            await promptDone();
          }
        }),
      new Html("button")
        .text("Background music settings")
        .on("click", async (e) => {
          let playBgm = await localforage.getItem("settings__playBgm");
          let bgmSong = await localforage.getItem("settings__bgmSong");

          async function promptDone() {
            await Root.Libs.Modal.Show({
              parent: wrapper,
              pid: Root.Pid,
              title: "Completed",
              description: "Your changes have been applied.",
              buttons: [
                {
                  type: "primary",
                  text: "OK",
                },
              ],
            });
          }

          const menuResult = await Root.Libs.Modal.Show({
            parent: wrapper,
            pid: Root.Pid,
            title: "Configure background music",
            description: "Which setting would you like to configure?",
            buttons: [
              {
                type: "primary",
                text: "Enable/disable music",
              },
              {
                type: "primary",
                text: "Change music",
              },
            ],
          });

          if (menuResult.canceled === true) return;
          if (menuResult.id === 0) {
            if (playBgm === null) playBgm = true;

            const result = await Root.Libs.Modal.Show({
              parent: wrapper,
              pid: Root.Pid,
              title: "Configure background music",
              description:
                "Background music is currently " +
                (playBgm === true ? "enabled" : "disabled") +
                ".",
              buttons: [
                {
                  type: "primary",
                  text: "On",
                },
                {
                  type: "primary",
                  text: "Off",
                },
              ],
            });

            if (result.canceled === true)
              return await Root.Libs.Modal.Show({
                parent: wrapper,
                pid: Root.Pid,
                title: "Setting not changed",
                description:
                  "The modal was closed, so the setting was not modified.",
                buttons: [
                  {
                    type: "primary",
                    text: "OK",
                  },
                ],
              });
            else {
              const value = result.id === 0 ? true : false;
              await localforage.setItem("settings__playBgm", value);

              const audio = Sfx.getAudio();
              if (value === true) {
                audio.play();
              } else {
                audio.pause();
              }
            }

            await promptDone();
          } else if (menuResult.id === 1) {
            const result = await Root.Libs.Modal.Show({
              parent: wrapper,
              pid: Root.Pid,
              title: "Configure background music",
              description: "Select the background music song to be played.",
              buttons: [
                {
                  type: "primary",
                  text: "Dreamy Ambience (default)",
                },
                {
                  type: "primary",
                  text: "Shopping Centre",
                },
                {
                  type: "primary",
                  text: "floating alone (cadecomposer)",
                },
                {
                  type: "primary",
                  text: "Ambient (NoctenUI)",
                },
                {
                  type: "primary",
                  text: "Homebrew Channel",
                },
                {
                  type: "primary",
                  text: "PS Music (PS5)",
                },
              ],
            });

            if (result.canceled === true) return;

            switch (result.id) {
              case 0:
                bgmSong = "/assets/audio/bgm_dreamy.mp3";
                break;
              case 1:
                bgmSong = "/assets/audio/bgm_shop.mp3";
                break;
              case 2:
                bgmSong = "/assets/audio/bgm_floating.mp3";
                break;
              case 3:
                bgmSong = "/assets/audio/bgm_nocturn.mp3";
                break;
              case 4:
                bgmSong = "/assets/audio/homebrew.mp3";
                break;
              case 5:
                bgmSong = "/assets/audio/bgm_ps.mp3";
                break;
            }

            await localforage.setItem("settings__bgmSong", bgmSong);

            let A;

            await Root.Libs.Modal.showWithoutButtons(
              "Loading",
              "Downloading content...",
              wrapper,
              Root.Pid,
              function (a) {
                A = a;
              }
            );

            await Sfx.changeBgm(bgmSong);

            await A();
            await promptDone();
          }
        })
    );

    const row4 = new Html("div").class("flex-list").appendTo(wrapper);

    row4.appendMany(
      new Html("button").text("Quit Settings").on("click", async (e) => {
        await Root.end();
      })
    );

    Ui.init(
      Root.Pid,
      "horizontal",
      [
        row0.elm.children,
        row1.elm.children,
        row2.elm.children,
        row3.elm.children,
        row4.elm.children,
      ],
      function (e) {
        if (e === "menu" || e === "back") {
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
