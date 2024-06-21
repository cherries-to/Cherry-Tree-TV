import Html from "/libs/html.js";
import Ws from "/libs/windowSystem.js";
import Keyboard from "/libs/keyboard.js";

let wrapper, Ui, Pid, Sfx;

const pkg = {
  name: "Debug App",
  type: "app",
  privs: 0,
  start: async function (Root) {
    Pid = Root.Pid;

    Ui = Root.Processes.getService("UiLib").data;

    wrapper = new Html("div").class("ui", "pad-top-sm", "gap").appendTo("body");

    Ui.transition("popIn", wrapper);

    Ui.becomeTopUi(Root.Pid, wrapper);

    Sfx = Root.Processes.getService("SfxLib").data;

    const sfxTests = [
      {
        label: "Modal show",
        sfx: "deck_ui_show_modal.wav",
      },
      {
        label: "Modal hide",
        sfx: "deck_ui_hide_modal.wav",
      },
      {
        label: "Enter submenu",
        sfx: "deck_ui_into_game_detail.wav",
      },
      {
        label: "Exit submenu",
        sfx: "deck_ui_out_of_game_detail.wav",
      },
    ];

    new Html("h1").text("Debug App").appendTo(wrapper);
    new Html("p").text("Here you can find testing things").appendTo(wrapper);

    new Html("h2").text("Sound test").appendTo(wrapper);
    new Html("p")
      .text("This lets you play sounds from the UI")
      .appendTo(wrapper);

    const row = new Html("div").class("flex-list").appendTo(wrapper);

    new Html("h2").text("Experiments").appendTo(wrapper);
    new Html("p")
      .text("Play around with some in-development features")
      .appendTo(wrapper);
    const row2 = new Html("div").class("flex-list").appendTo(wrapper);

    row2.appendMany(
      new Html("button").text("Notify test").on("click", async (e) => {
        Root.Libs.Notify.show("Test notification", "This is a test.");
      }),
      new Html("button")
        .text("Test modal with delay")
        .on("click", async (e) => {
          await Root.Libs.Modal.showWithoutButtons(
            "Temp modal",
            "Showing for 3 seconds...",
            wrapper,
            Root.Pid,
            function (a) {
              setTimeout((_) => {
                console.log("ok");
                a();
              }, 3000);
            }
          );
        }),
      new Html("button").text("Custom number input").on("click", async (e) => {
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
              new Html("button").text("Confirm").on("click", (e) =>
                cb({
                  canceled: false,
                  text: inputBox.elm.textContent,
                  id: -1,
                })
              ),
              new Html("button").text("0").on("click", (e) => handleInput(e)),
              new Html("button")
                .text("Backspace")
                .on(
                  "click",
                  (e) =>
                    (inputBox.elm.textContent =
                      inputBox.elm.textContent.substring(
                        0,
                        inputBox.elm.textContent.length - 1
                      ))
                )
            )
          );

        const result = await Root.Libs.Modal.Show({
          parent: wrapper,
          pid: Root.Pid,
          title: "Experiment",
          description: "Testing a multi row div.",
          type: "custom",
          customSfx: {
            hover: "deck_ui_navigation.wav",
            activate: "deck_ui_typing.wav",
          },
          customData: ContainerDiv,
          customType: "test",
          dataHandler: function (clb) {
            // Callback the callback
            cb = clb;
          },
          // buttons: [{ type: "primary", text: "Label" }],
        });

        await Root.Libs.Modal.Show({
          parent: wrapper,
          pid: Root.Pid,
          title: "Result",
          description: `You typed:\n\n${inputBox.elm.textContent}`,
          buttons: [
            {
              type: "primary",
              text: "OK",
            },
          ],
        });
      }),
      new Html("button").text("Custom text input").on("click", async (e) => {
        let ContainerDiv = new Html("div").class("flex-col");

        let inputBox = new Html("div")
          .class("input")
          .attr({ type: "text" })
          .appendTo(ContainerDiv);

        let cb;

        const kb = Keyboard.new;

        const keyboard = await kb(function (e) {
          switch (e.type) {
            case "key":
              inputBox.elm.textContent += e.data;
              break;
            case "special":
              switch (e.data) {
                case "backspace":
                  inputBox.elm.textContent = inputBox.elm.textContent.substring(
                    0,
                    inputBox.elm.textContent.length - 1
                  );
                  break;
              }
              break;
          }
        });

        // input list
        new Html("div")
          .appendTo(ContainerDiv)
          .class("flex-col-small", "buttons")
          .appendMany(
            ...keyboard.keysListHtml,
            new Html("div").class("flex-row-small").appendMany(
              new Html("button").text("Confirm").on("click", (e) =>
                cb({
                  canceled: false,
                  text: inputBox.elm.textContent,
                  id: -1,
                })
              ),
              new Html("button")
                .text("Cancel")
                .on("click", (e) => cb({ canceled: true, text: null, id: -1 }))
            )
          );

        const result = await Root.Libs.Modal.Show({
          parent: wrapper,
          pid: Root.Pid,
          title: "Experiment",
          description: "Testing a multi row div.",
          type: "custom",
          customSfx: {
            hover: "deck_ui_navigation.wav",
            activate: "deck_ui_typing.wav",
          },
          customData: ContainerDiv,
          customType: "test",
          buttonCallback: function (btn) {
            keyboard.buttonHandler(btn);
          },
          dataHandler: function (clb) {
            // Callback the callback
            cb = clb;
          },
          // buttons: [{ type: "primary", text: "Label" }],
        });

        await Root.Libs.Modal.Show({
          parent: wrapper,
          pid: Root.Pid,
          title: "Result",
          description: `You typed:\n\n${inputBox.elm.textContent}`,
          buttons: [
            {
              type: "primary",
              text: "OK",
            },
          ],
        });
      })
    );

    new Html("h2").text("Debug").appendTo(wrapper);

    new Html("p").text("Basic debugging features").appendTo(wrapper);

    const row3 = new Html("div").class("flex-list").appendTo(wrapper);

    row3.appendMany(
      new Html("button").text("Show test modal").on("click", async (e) => {
        await Root.Libs.Modal.Show({
          parent: wrapper,
          pid: Root.Pid,
          title: "Title",
          description: "This is a test modal.",
          buttons: [
            {
              type: "primary",
              text: "OK",
            },
          ],
        });
      }),
      new Html("button").text("Exit this app").on("click", async (e) => {
        await Root.end();
      })
    );

    sfxTests.forEach((s) => {
      new Html("button")
        .text(s.label)
        .on("click", (e) => {
          Sfx.playSfx(s.sfx);
        })
        .appendTo(row);
    });

    Ui.init(
      Root.Pid,
      "horizontal",
      [row.elm.children, row2.elm.children, row3.elm.children],
      function (e) {
        if (e === "menu" || e === "back") {
          Root.end();
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
