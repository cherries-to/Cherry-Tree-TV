import vfs from "/libs/vfs.js";
import Html from "/libs/html.js";

let Pid, Ui, wrapper, Sfx, cb;

const pkg = {
  name: "Oobe",
  type: "app",
  privs: 0,
  start: async function (Root) {
    console.log("Hi! From Oobe");
    console.log(vfs);

    if (Root.Arguments && Root.Arguments.length > 0) cb = Root.Arguments[0];

    Sfx = Root.Processes.getService("SfxLib").data;
    const UserSvc = Root.Processes.getService("UserSvc").data;
    const Background = Root.Processes.getService("Background").data;
    Pid = Root.Pid;
    Ui = Root.Processes.getService("UiLib").data;

    // Your user token
    let token = "";

    wrapper = new Html("div").class("full-ui").appendTo("body");

    let page = new Html("div").class("oobe-page").appendTo(wrapper);
    let bar = new Html("div").class("oobe-bar").appendTo(wrapper);

    let barLeft = new Html("div").class("left").appendTo(bar);
    let barRight = new Html("div").class("right").appendTo(bar);

    let svg = await (await fetch("/assets/img/oobe/welcome_row.svg")).text();
    const ip = await fetch("http://localhost:9864/local_ip").then((t) =>
      t.text()
    );

    let textData = {};

    async function promptForInput(
      title,
      description,
      parent,
      isPassword = false,
      resultName
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

      parent.dataset.realText = result;
      if (isPassword === true) {
        parent.textContent = "•".repeat(result.length);
      } else parent.textContent = result;
      textData[resultName] = result;
    }

    let pages = {
      welcome: {
        // Main parent element on top
        elm: new Html("div").class("flex-row").appendMany(
          new Html("div")
            .style({
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%,-50%)",
            })
            .html(svg),
          // Still needs a button on the page...
          new Html("div")
            .class("button-row")
            .style({ display: "none" })
            .appendMany(new Html("button").text("..."))
        ),
        // bottom bar buttons
        barButtons: {
          // Buttons call a page
          left: [{ text: "Configure", goto: "setup" }],
          right: [{ text: "Get started", goto: "controllerSetup" }],
        },
      },
      setup: {
        // Main parent element on top
        elm: new Html("div").class("flex-row").appendMany(
          // Still needs a button on the page...
          new Html("div").class("button-row", "flex-row").appendMany(
            new Html("button").text("UI scaling").on("click", async (e) => {
              let getScaleValue = Ui.scaling.getScaleValue;

              let values = [
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
              await localforage.setItem(
                "settings__uiScale",
                values[result.id].scale
              );
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
                    description:
                      "Select the background music song to be played.",
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
          )
        ),
        // bottom bar buttons
        barButtons: {
          // Buttons call a page
          right: [{ text: "Back", goto: "welcome" }],
        },
      },
      controllerSetup: {
        // Main parent element on top
        elm: new Html("div").class("flex-list", "oobe-spaced").appendMany(
          new Html("div").class("flex-col").appendMany(
            new Html("h1").text("Phone Link Setup"),
            new Html("p").text(
              "Want to use your phone as a TV remote? \n Scan the QR code shown on screen."
            ),
            new Html("div").class("button-row").appendMany(
              new Html("button").text("Help").on("click", async (e) => {
                Root.Libs.Modal.Show({
                  title: "Phone Link Help",
                  description:
                    `On your phone, go to this URL: ${location.protocol}//${ip}:${location.port}/link\n\n` +
                    `Once you connect, you should see a prompt asking you to enter a code. Use the code in the top right of the screen, or find it in Settings.`,
                  // description: `On your phone, go to this URL: ${
                  //   location.protocol
                  // }//${location.host}/phonelink\n\n${
                  //   location.hostname === "127.0.0.1" ||
                  //   location.hostname === "localhost"
                  //     ? "You are using localhost. On your phone, you will not be able to connect to localhost or 127.0.0.1. Please use your local IP address to reach your cherry tree instance."
                  //     : "You are running off of your local IP already so you should be fine"
                  // }\n\nOnce you connect, you should see a prompt asking you to enter a code. Use the code in the top right of the screen, or find it in Settings.`,
                  parent: document.body,
                  pid: Root.Pid,
                  buttons: [{ type: "primary", text: "OK" }],
                });
              })
            )
          ),
          new Html("div").class("flex-col").appendMany(
            new Html("img")
              .attr({
                src: `http://127.0.0.1:9864/qr?url=${location.protocol}//${ip}:${location.port}/link/index.html?code=${window.phoneLinkCode}`,

                // src: `${location.protocol}//${location.hostname}:9864/qr?url=${location.protocol}//${ip}:${location.port}/link/index.html?code=${window.phoneLinkCode}`,
              })
              .styleJs({
                borderRadius: "5px",
              })
          )
        ),
        // bottom bar buttons
        barButtons: {
          // Buttons call a page
          left: [{ text: "Back", goto: "welcome" }],
          right: [{ text: "Next", goto: "account" }],
        },
      },
      // controllerHelp: {
      //   // Main parent element on top
      //   elm: new Html("div")
      //     .class("flex-col")
      //     .appendMany(
      //       new Html("h1").text("Controller Help"),
      //       new Html("p").text(
      //         "Your controller may not be supported by the app."
      //       ),
      //       new Html("p").text("Officially supported controllers:"),
      //       new Html("ul").appendMany(
      //         new Html("li").text("Xbox 360, One, and Series S/X"),
      //         new Html("li").text("DualShock 3, 4, and DualSense"),
      //         new Html("li").text("Nintendo Switch Pro Controller"),
      //         new Html("li").text(
      //           "Any Bluetooth or USB-compatible Xinput gamepad (depends on your system)"
      //         )
      //       )
      //     ),
      //   // bottom bar buttons
      //   barButtons: {
      //     // Buttons call a page
      //     left: [{ text: "Back", goto: "controllerSetup" }],
      //   },
      // },
      account: {
        // Main parent element on top
        elm: new Html("div").class("flex-list", "oobe-spaced").appendMany(
          new Html("div")
            .class("flex-col")
            .appendMany(
              new Html("h1").text("Register with Cherries."),
              new Html("p").text("Please  or register with Cherries.")
            ),
          new Html("div").class("flex-col").appendMany(
            new Html("div").class("button-row").appendMany(
              new Html("button").text("Login").on("click", (e) => {
                switchPage("login");
              })
            ),
            new Html("div").class("button-row").appendMany(
              new Html("button").text("Register").on("click", (e) => {
                switchPage("register");
              })
            )
          )
        ),
        // bottom bar buttons
        barButtons: {
          // Buttons call a page
          left: [{ text: "Back", goto: "controllerSetup" }],
          right: [
            {
              text: "Skip",
              goto: async function () {
                let result = await Root.Libs.Modal.Show({
                  title: "Are you really sure you want to skip?",
                  description:
                    "You won't be logged in and will miss out on some features.",
                  pid: Root.Pid,
                  parent: document.body,
                  buttons: [
                    { type: "primary", text: "No" },
                    { type: "primary", text: "Yes" },
                  ],
                });

                if (result.id === 1) {
                  switchPage("thanks");
                }
              },
            },
          ],
        },
      },
      login: {
        // Main parent element on top
        elm: new Html("div").class("flex-row", "oobe-spaced").appendMany(
          new Html("div")
            .class("flex-col")
            .appendMany(
              new Html("h1").text("Login with Cherries."),
              new Html("p").html(
                "By signing in you agree and comply<br>with our Legal Information over at<br><a href='https://cherries.to'>cherries.to/legal/</a>"
              )
            ),
          new Html("div").class("flex-col").appendMany(
            new Html("div").class("button-row", "flex-col").appendMany(
              new Html("span").text("username/email"),
              new Html("button").class("input-box").on("click", (e) => {
                promptForInput(
                  "Username",
                  "Your Cherries account username",
                  e.target,
                  false,
                  "login_username"
                );
              })
            ),
            new Html("div").class("button-row", "flex-col").appendMany(
              new Html("span").text("password"),
              new Html("button").class("input-box").on("click", (e) => {
                promptForInput(
                  "Password",
                  "Your Cherries account password",
                  e.target,
                  true,
                  "login_password"
                );
              })
            )
          )
        ),
        // bottom bar buttons
        barButtons: {
          // Buttons call a page
          left: [{ text: "Back", goto: "account" }],
          right: [
            {
              text: "Next",
              goto: async function (e) {
                e.target.disabled = true;
                let result;
                try {
                  result = await UserSvc.login(
                    textData["login_username"],
                    textData["login_password"]
                  );

                  if (result.success === false) throw result; // trigger catch
                } catch (e) {
                  Root.Libs.Notify.show(
                    "Failed to login",
                    "Something went wrong: " + e.message
                  );
                } finally {
                  e.target.disabled = false;
                }

                if (result.token !== undefined && result.success === true) {
                  token = result.token;

                  let checksComplete = 0;
                  function checks() {
                    if (checksComplete === 2) switchPage("thanks");
                  }

                  UserSvc.subscribe(token).then((ws) => {
                    Root.Security.setSecureVariable("CHERRY_TREE_WS", ws);
                    checksComplete++;
                    checks();
                  });
                  Root.Security.setToken(token).then((_) => {
                    checksComplete++;
                    checks();
                  });

                  return "loading";
                }
                return false;
              },
            },
          ],
        },
      },
      register: {
        // Main parent element on top
        elm: new Html("div").class("flex-row", "oobe-spaced").appendMany(
          new Html("div")
            .class("flex-col")
            .appendMany(
              new Html("h1").text("Register with Cherries."),
              new Html("p").html(
                "By registering in you agree and comply<br>with our Legal Information over at<br><a href='https://cherries.to'>cherries.to/legal/</a>"
              )
            ),
          new Html("div").class("flex-col").appendMany(
            new Html("div").class("button-row", "flex-col").appendMany(
              new Html("span").text("username"),
              new Html("button").class("input-box").on("click", (e) => {
                promptForInput(
                  "Username",
                  "Your Cherries account username",
                  e.target,
                  false,
                  "register_username"
                );
              })
            ),
            new Html("div").class("button-row", "flex-col").appendMany(
              new Html("span").text("email"),
              new Html("button").class("input-box").on("click", (e) => {
                promptForInput(
                  "Email",
                  "Your Cherries account email",
                  e.target,
                  false,
                  "register_email"
                );
              })
            ),
            new Html("div").class("button-row", "flex-col").appendMany(
              new Html("span").text("password"),
              new Html("button").class("input-box").on("click", (e) => {
                promptForInput(
                  "Password",
                  "Your Cherries account password",
                  e.target,
                  true,
                  "register_password"
                );
              })
            )
          )
        ),
        // bottom bar buttons
        barButtons: {
          // Buttons call a page
          left: [{ text: "Back", goto: "account" }],
          right: [
            {
              text: "Next",
              goto: async function (e) {
                e.target.disabled = true;
                let result;
                try {
                  let result2 = await UserSvc.register(
                    textData["register_username"],
                    textData["register_password"],
                    textData["register_email"]
                  );
                  console.log(result2);

                  result = await UserSvc.login(
                    textData["register_username"],
                    textData["register_password"]
                  );
                  console.log(result);

                  if (result.success === false) throw result; // trigger catch
                } catch (e) {
                  Root.Libs.Notify.show(
                    "Failed to login",
                    "Something went wrong: " + e.message
                  );
                } finally {
                  e.target.disabled = false;
                }

                if (result.token !== undefined && result.success === true) {
                  token = result.token;

                  let checksComplete = 0;
                  function checks() {
                    if (checksComplete === 2) switchPage("thanks");
                  }

                  UserSvc.subscribe(token).then((ws) => {
                    Root.Security.setSecureVariable("CHERRY_TREE_WS", ws);
                    checksComplete++;
                    checks();
                  });
                  Root.Security.setToken(token).then((_) => {
                    checksComplete++;
                    checks();
                  });

                  return "loading";
                }
                return false;
              },
            },
          ],
        },
      },
      loading: {
        elm: new Html("div")
          .class("flex-row", "oobe-spaced")
          .appendMany(
            new Html("div")
              .class("flex-col")
              .appendMany(new Html("h1").text("Logging in...")),
            new Html("div")
              .class("flex-col")
              .html(
                `<img class="loading" draggable="false" src="data:image/svg+xml,%3Csvg width='48' height='48' viewBox='0 0 48 48' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cg clip-path='url(%23clip0_1114_2788)'%3E%3Cpath d='M44.3563 24C46.3687 24 48.0283 22.3595 47.7239 20.3703C47.4328 18.4675 46.9131 16.6022 46.1731 14.8156C44.967 11.9038 43.1992 9.25804 40.9706 7.02944C38.742 4.80083 36.0962 3.033 33.1844 1.82689C30.2726 0.620778 27.1517 -1.37766e-07 24 0C20.8483 1.37766e-07 17.7274 0.620779 14.8156 1.82689C11.9038 3.033 9.25804 4.80083 7.02944 7.02944C4.80083 9.25804 3.033 11.9038 1.82689 14.8156C1.08686 16.6022 0.56719 18.4675 0.276061 20.3703C-0.0282817 22.3595 1.63132 24 3.64366 24C5.656 24 7.24768 22.3498 7.68294 20.3851C7.89306 19.4367 8.18597 18.5061 8.55949 17.6043C9.39938 15.5767 10.6304 13.7343 12.1823 12.1823C13.7343 10.6304 15.5767 9.39939 17.6043 8.55949C19.632 7.7196 21.8053 7.28732 24 7.28732C26.1947 7.28732 28.368 7.7196 30.3957 8.55949C32.4233 9.39939 34.2657 10.6304 35.8176 12.1823C37.3696 13.7343 38.6006 15.5767 39.4405 17.6043C39.814 18.5061 40.1069 19.4367 40.3171 20.3851C40.7523 22.3498 42.344 24 44.3563 24Z' fill='url(%23paint0_linear_1114_2788)'/%3E%3C/g%3E%3Cdefs%3E%3ClinearGradient id='paint0_linear_1114_2788' x1='0' y1='24' x2='48' y2='24' gradientUnits='userSpaceOnUse'%3E%3Cstop stop-opacity='0'/%3E%3Cstop offset='1' stop-color='white'/%3E%3C/linearGradient%3E%3CclipPath id='clip0_1114_2788'%3E%3Crect width='48' height='48' fill='white'/%3E%3C/clipPath%3E%3C/defs%3E%3C/svg%3E" />`
              )
          ),
        barButtons: {
          left: [],
          right: [],
        },
      },
      thanks: {
        // Main parent element on top
        elm: new Html("div").class("flex-row", "oobe-spaced").appendMany(
          new Html("div")
            .class("flex-col")
            .appendMany(
              new Html("h1").text("Thank you"),
              new Html("p").html(
                "We hope you enjoy your Home, Entertainment and Experience. Your support means the world."
              )
            )
          // new Html("div").class("flex-col").appendMany(
          //   new Html("div").class("button-row", "flex-col").appendMany(
          //     new Html("span").text("password"),
          //     new Html("button").class("input-box").on("click", (e) => {
          //       promptForInput(
          //         "Password",
          //         "Your Cherries account password",
          //         e.target,
          //         true,
          //         "register_password"
          //       );
          //     })
          //   )
          // )
        ),
        // bottom bar buttons
        barButtons: {
          // Buttons call a page
          left: [],
          right: [
            {
              text: "Finish",
              goto: async function () {
                Root.end();
                return true;
              },
            },
          ],
        },
      },
    };

    Object.keys(pages).forEach((k) => {
      pages[k].elm.classOn("oobe-page");
      pages[k].elm.class("oobe-page");
    });

    async function switchPage(name) {
      if (pages[name] === undefined) return;
      page.html("");
      barLeft.html("");
      barRight.html("");
      pages[name].elm.appendTo(page);

      // Add the page's Buttons
      if (pages[name].barButtons.left !== undefined) {
        pages[name].barButtons.left.forEach((b) => {
          barLeft.append(
            new Html("button").text(b.text).on("click", async (e) => {
              if (typeof b.goto === "string") await switchPage(b.goto);
              else if (typeof b.goto === "function") {
                let result = await b.goto(e);
                if (result === false) return;
                if (typeof result === "string") await switchPage(result);
              }
            })
          );
        });
      }
      if (pages[name].barButtons.right !== undefined) {
        pages[name].barButtons.right.forEach((b) => {
          barRight.append(
            new Html("button").text(b.text).on("click", async (e) => {
              if (typeof b.goto === "string") await switchPage(b.goto);
              else if (typeof b.goto === "function") {
                let result = await b.goto(e);
                if (result === false) return;
                if (typeof result === "string") await switchPage(result);
              }
            })
          );
        });
      }

      let buttonRows = [[]];
      if (pages[name].elm.elm.querySelector(".button-row") !== undefined) {
        buttonRows = Array.from(
          pages[name].elm.elm.querySelectorAll(".button-row")
        ).map((m) => {
          return m.children;
        });
      }

      Ui.updatePos(Root.Pid, { x: 0, y: 0 });
      Ui.update(Root.Pid, [
        ...buttonRows,
        Array.from(barLeft.elm.children).concat(
          Array.from(barRight.elm.children)
        ),
      ]);
      Ui.focus.focusCurrent(Root.Pid);
      Sfx.playSfx("deck_ui_tab_transition_01.wav");
    }

    Ui.transition("popIn", wrapper);
    Ui.becomeTopUi(Root.Pid, wrapper);

    Ui.init(
      Root.Pid,
      "horizontal",
      [[], []]
      // function (e) {
      //   if (e === "menu" || e === "back") {
      //     pkg.end();
      //   }
      // }
    );
    await switchPage("welcome");
  },
  end: async function () {
    // Exit this UI when the process is exited
    Ui.cleanup(Pid);
    Sfx.playSfx("deck_ui_out_of_game_detail.wav");
    // await Ui.transition("popOut", wrapper);
    Ui.giveUpUi(Pid);
    wrapper.cleanup();

    if (cb) cb();
  },
};

export default pkg;
