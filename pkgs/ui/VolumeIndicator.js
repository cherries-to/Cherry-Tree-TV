import Html from "/libs/html.js";

let volumeIndicator, Sfx;
const pkg = {
  name: "Volume Indicator",
  type: "app",
  privs: 0,
  start: async function (Root) {
    volumeIndicator = new Html("div")
      .styleJs({
        background: "#6667",
        backdropFilter: "blur(10px)",
        padding: "0.75rem 1.5rem",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        gap: "0.5rem",
        borderRadius: "8px",
        position: "fixed",
        top: "1rem",
        left: "2rem",
        "z-index": 1000000,
        opacity: 0,
      })
      .classOn("slideUpOut")
      .appendTo("body");

    Sfx = Root.Processes.getService("SfxLib").data;

    let volume = 100,
      volumeIcon = new Html("span")
        .classOn("icon")
        // .style({ width: "1.5rem", height: "1.5rem" })
        .appendTo(volumeIndicator),
      volumeBarInner = new Html("span").styleJs({
        background: "var(--current-player)",
        height: "8px",
        borderRadius: "99px",
        transition: "all 0.1s cubic-bezier(0.87, 0, 0.13, 1)",
      }),
      volumeBar = new Html("span")
        .styleJs({
          width: "max(10vmax, 300px)",
          height: "8px",
          display: "flex",
          borderRadius: "99px",
          background: "#111",
          overflow: "clip",
        })
        .append(volumeBarInner)
        .appendTo(volumeIndicator),
      sInterval = null,
      isShown = false;

    let Icons = {
      volumeMute: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-volume-x"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><line x1="22" x2="16" y1="9" y2="15"/><line x1="16" x2="22" y1="9" y2="15"/></svg>`,
      volumeLow: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-volume-1"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M15.54 8.46a5 5 0 0 1 0 7.07"/></svg>`,
      volumeDim: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M11 5L6 9H2V15H6L11 19V5Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path d="M15.5391 8.45996C16.4764 9.3976 17.003 10.6691 17.003 11.995C17.003 13.3208 16.4764 14.5923 15.5391 15.53" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path opacity="0.3" d="M19.0703 4.92969C20.945 6.80496 21.9982 9.34805 21.9982 11.9997C21.9982 14.6513 20.945 17.1944 19.0703 19.0697" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
      volumeMax:
        '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-volume-2"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M15.54 8.46a5 5 0 0 1 0 7.07"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14"/></svg>',
    };

    function showVolume() {
      // vol checks
      if (volume < 0) {
        volume = 0;
        Sfx.playSfx("deck_ui_bumper_end_02.wav");
      } else if (volume > 100) {
        volume = 100;
        Sfx.playSfx("deck_ui_bumper_end_02.wav");
      } else {
        Sfx.playSfx("deck_ui_volume.wav");
      }
      if (volume <= 100 && volume >= 60) {
        volumeIcon.html(Icons.volumeMax);
      } else if (volume <= 60 && volume >= 30) {
        volumeIcon.html(Icons.volumeDim);
      } else if (volume <= 30 && volume >= 1) {
        volumeIcon.html(Icons.volumeLow);
      } else if (volume === 0) {
        volumeIcon.html(Icons.volumeMute);
      }

      volumeBarInner.style({ width: volume + "%" });

      if (isShown === false) {
        isShown = true;
        volumeIndicator.classOff("slideUpOut").classOn("slideUpIn");
      }

      Sfx.setVolume(volume / 100);

      document.dispatchEvent(
        new CustomEvent("CherryTree.Ui.VolumeChange", {
          detail: volume,
        })
      );

      clearInterval(sInterval);
      sInterval = setTimeout(() => {
        volumeIndicator.classOff("slideUpIn").classOn("slideUpOut");
        setTimeout(() => {
          isShown = false;
        }, 500);
      }, 3000);
    }
    console.log("volume is ready", volumeIndicator);

    document.addEventListener("CherryTree.Input.VolumeDown", () => {
      volume -= 5;
      showVolume();
    });
    document.addEventListener("CherryTree.Input.VolumeUp", () => {
      volume += 5;
      showVolume();
    });
  },
  async end() {
    volumeIndicator.cleanup();
  },
};

export default pkg;
