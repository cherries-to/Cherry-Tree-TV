// this is a test...
const ROOT = location.protocol + "//" + location.host;
const loadModule = async (module) => (await import(`${ROOT}${module}`)).default;
const Html = await loadModule("/libs/html.js");
const Keyboard = await loadModule("/libs/keyboard.js");
const vfs = await loadModule("/libs/vfs.js");

let wrapper, Ui, Pid, Sfx;

const pkg = {
  name: "Novello Testing",
  type: "app",
  privs: 0,
  start: async function (Root) {
    Pid = Root.Pid;

    Ui = Root.Processes.getService("UiLib").data;

    wrapper = new Html("div")
      .class("full-ui")
      .styleJs({ width: "100%" })
      .appendTo("body");

    Ui.becomeTopUi(Pid, wrapper);

    Sfx = Root.Processes.getService("SfxLib").data;

    Sfx.playSfx("deck_ui_into_game_detail.wav");

    const Background = Root.Processes.getService("Background").data;

    console.log(Sfx);

    let nvObject;

    async function closeSequence() {
      if (nvObject && nvObject.bgmSource) {
        nvObject.bgmSource.stop();
      }
      pkg.end();
    }

    const Novello = (
      await import("http://127.0.0.1:5500/component.js?t=" + Date.now())
    ).default;

    nvObject = new Novello(wrapper.elm);
    console.log(nvObject);

    nvObject.read(
      await (
        await fetch("http://127.0.0.1:5500/file.json?t=" + Date.now())
      ).json()
    );

    Ui.transition("popIn", wrapper);

    Ui.init(Pid, "horizontal", [wrapper], function (e) {
      if (e === "menu" || e === "back") {
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
