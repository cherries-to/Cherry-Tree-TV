import Html from "/libs/html.js";
import LangManager from "../../libs/l10n/manager.js";

let wrapper;

const pkg = {
  name: "Boot Manager",
  type: "app",
  privs: 1,
  start: async function (Root) {
    console.log("[BootManager] Started", Root);
    const loadingScreen = document.querySelector("#loading");
    if (loadingScreen) loadingScreen.remove();

    // steam deck easter egg if someone finds this
    wrapper = new Html("div")
      .class("flex")
      .styleJs({
        width: "100%",
        height: "100%",
        position: "absolute",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        top: 0,
        left: 0,
        opacity: 0,
      })
      .html(
        // `<video autoplay><source src="https://cdn.discordapp.com/attachments/1176299405641515008/1202742243992014948/qshide.mov?ex=65f37a00&is=65e10500&hm=6f3647db9eee395f797e434c834f40ba502ce5af17b8d8606dc76d662d425bb5&"></video>`
        // `<video autoplay><source src="https://cdn.discordapp.com/attachments/767080494269333504/1223704473617305640/briish.mp4?ex=661ad299&is=66085d99&hm=d8bf74e2b82b48ad5cb1a3b935621ed4aaa521ded2495cb38a3f5f4fcdff1398&"></video>`
        // `<video style="mix-blend-mode: difference;" autoplay><source src="/assets/saturn.webm"></video>`
        `<svg width="15%" height="15%" viewBox="0 0 142 142" fill="none" xmlns="http://www.w3.org/2000/svg">
        <g clip-path="url(#clip0_1988_683)">
        <path d="M102.552 94.6667C101.771 94.6667 100.986 94.434 100.295 93.9528C74.4869 75.8872 52.3073 45.1758 39.5628 25.1656C46.2644 66.6927 43.4954 90.0833 43.3573 91.2114C43.0891 93.3729 41.1406 94.8797 38.9593 94.6352C36.7977 94.3669 35.2633 92.3987 35.5316 90.2371C35.5671 89.9255 39.2236 58.5514 27.6979 4.76889C27.2837 2.84794 28.3527 0.911223 30.1987 0.240667C32.0368 -0.437777 34.1076 0.351112 35.0346 2.08667C35.3462 2.67044 66.6177 60.7524 104.816 87.4918C106.603 88.7382 107.033 91.1995 105.786 92.9824C105.021 94.0829 103.798 94.6667 102.552 94.6667Z" fill="#77B255"/>
        <path d="M104.713 34.782C91.0023 38.5687 84.7898 44.8246 62.3144 37.413C43.6966 31.2715 34.5573 20.8187 37.2869 12.5432C40.0164 4.2678 49.8302 0.0669711 68.448 6.20847C87.1802 12.3894 84.7109 19.8799 104.713 34.782Z" fill="#5C913B"/>
        <path d="M102.556 142C119.983 142 134.111 127.872 134.111 110.444C134.111 93.0168 119.983 78.8889 102.556 78.8889C85.1279 78.8889 71 93.0168 71 110.444C71 127.872 85.1279 142 102.556 142Z" fill="#BE1931"/>
        <path d="M43.3889 142C60.8166 142 74.9445 127.872 74.9445 110.444C74.9445 93.0168 60.8166 78.8889 43.3889 78.8889C25.9613 78.8889 11.8334 93.0168 11.8334 110.444C11.8334 127.872 25.9613 142 43.3889 142Z" fill="#BE1931"/>
        </g>
        <defs>
        <clipPath id="clip0_1988_683">
        <rect width="142" height="142" fill="white"/>
        </clipPath>
        </defs>
        </svg>`
        // `<video style="mix-blend-mode: difference;" autoplay><source src="https://cdn.discordapp.com/attachments/767080494269333504/1223704473617305640/briish.mp4?ex=661ad299&is=66085d99&hm=d8bf74e2b82b48ad5cb1a3b935621ed4aaa521ded2495cb38a3f5f4fcdff1398&"></video>`
        // // `<h1>Preparing...</h1><img class="loading" draggable="false" src="data:image/svg+xml,%3Csvg width='48' height='48' viewBox='0 0 48 48' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cg clip-path='url(%23clip0_1114_2788)'%3E%3Cpath d='M44.3563 24C46.3687 24 48.0283 22.3595 47.7239 20.3703C47.4328 18.4675 46.9131 16.6022 46.1731 14.8156C44.967 11.9038 43.1992 9.25804 40.9706 7.02944C38.742 4.80083 36.0962 3.033 33.1844 1.82689C30.2726 0.620778 27.1517 -1.37766e-07 24 0C20.8483 1.37766e-07 17.7274 0.620779 14.8156 1.82689C11.9038 3.033 9.25804 4.80083 7.02944 7.02944C4.80083 9.25804 3.033 11.9038 1.82689 14.8156C1.08686 16.6022 0.56719 18.4675 0.276061 20.3703C-0.0282817 22.3595 1.63132 24 3.64366 24C5.656 24 7.24768 22.3498 7.68294 20.3851C7.89306 19.4367 8.18597 18.5061 8.55949 17.6043C9.39938 15.5767 10.6304 13.7343 12.1823 12.1823C13.7343 10.6304 15.5767 9.39939 17.6043 8.55949C19.632 7.7196 21.8053 7.28732 24 7.28732C26.1947 7.28732 28.368 7.7196 30.3957 8.55949C32.4233 9.39939 34.2657 10.6304 35.8176 12.1823C37.3696 13.7343 38.6006 15.5767 39.4405 17.6043C39.814 18.5061 40.1069 19.4367 40.3171 20.3851C40.7523 22.3498 42.344 24 44.3563 24Z' fill='url(%23paint0_linear_1114_2788)'/%3E%3C/g%3E%3Cdefs%3E%3ClinearGradient id='paint0_linear_1114_2788' x1='0' y1='24' x2='48' y2='24' gradientUnits='userSpaceOnUse'%3E%3Cstop stop-opacity='0'/%3E%3Cstop offset='1' stop-color='white'/%3E%3C/linearGradient%3E%3CclipPath id='clip0_1114_2788'%3E%3Crect width='48' height='48' fill='white'/%3E%3C/clipPath%3E%3C/defs%3E%3C/svg%3E" />`
      )
      .appendTo("body");

    let startupSound = new Audio("/assets/audio/startup.mp3");
    let hasLoaded = false;
    startupSound.addEventListener("loadeddata", () => {
      if (hasLoaded === true) return;
      hasLoaded = true;
      beginAnimation();
    });
    setTimeout(() => {
      startupSound.load();
    }, 16);

    console.log("waiting for load");

    function beginAnimation() {
      wrapper.style({ opacity: 1 });
      console.log("LOADED");
      let animation = "logoAnimate";

      wrapper.classOn(`${animation}In`);

      setTimeout(() => {
        startupSound.volume = 0.5;
        startupSound.play();
      }, 1000);

      setTimeout(() => {
        wrapper.classOff(`${animation}In`).classOn(`${animation}Out`);
        setTimeout(() => {
          wrapper.cleanup();
          doEverythingElse();
        }, 1000);
      }, 1000);
    }

    // wrapper.queryHtml("video").on("pause", doEverythingElse);

    await Root.Core.pkg.run("services:SfxLib", [], true);
    await Root.Core.pkg.run("services:UiLib", [], true);
    await Root.Core.pkg.run("services:Users", [], true);

    // Users is loaded
    let userSvc = Root.Processes.getService("UserSvc").data;

    await Root.Core.pkg.run("ui:Background", [], true);
    await Root.Core.pkg.run("ui:VolumeIndicator", [], true);
    await Root.Core.pkg.run("ui:StatusIndicator", [], true);
    // doEverythingElse();

    async function doEverythingElse() {
      async function runOobe() {
        await Root.Core.pkg.run(
          "system:Oobe",
          [
            async function oobeCallback() {
              await Root.Core.pkg.run("ui:MainMenu", [], true);
            },
          ],
          true
        );
      }

      let t = await Root.Security.getToken();
      if (t !== "") {
        let result = await userSvc.validateJwt(t);
        if (result.success === true) {
          Root.Security.setSecureVariable(
            "CHERRY_TREE_WS",
            await userSvc.subscribe(t)
          );
          await Root.Core.pkg.run("ui:MainMenu", [], true);
        } else {
          runOobe();
        }
      } else {
        runOobe();
      }
      wrapper.class("popOut");

      let mvT;

      window.addEventListener("mousemove", (e) => {
        clearTimeout(mvT);
        document.body.classList.remove("mouse-disabled");
        mvT = setTimeout(() => {
          document.body.classList.add("mouse-disabled");
          console.log("Mouse is inactive");
        }, 5000);
      });

      return;
    }
  },
  end: async function () {
    wrapper.cleanup();
  },
};

export default pkg;
