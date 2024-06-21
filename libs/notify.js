import Html from "/libs/html.js";

let notifyBox, Processes;
let Sfx = { playSfx() {} };

export default {
  init: function (Proc) {
    Processes = Proc;
    // SfxLib = Processes.getService('SfxLib');

    let loop = setInterval((_) => {
      if (Processes.getService("SfxLib") !== undefined) {
        clearInterval(loop);
        Sfx = Processes.getService("SfxLib").data;
      }
    }, 1000);
  },
  show: function (title, description) {
    if (notifyBox === undefined)
      notifyBox = new Html("div").class("notify-box").appendTo("body");

    Sfx.playSfx("deck_ui_toast.wav");

    let notify = new Html("div")
      .class("notify", "slideIn")
      .appendMany(
        new Html("div").class("notify-title").text(title),
        new Html("div").class("notify-text").text(description)
      )
      .appendTo(notifyBox);
    setTimeout(() => {
      notify.classOff("slideIn").classOn("slideOut");
      setTimeout(() => {
        notify.cleanup();
      }, 500);
    }, 5000);
  },
};
