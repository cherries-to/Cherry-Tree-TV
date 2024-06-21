import Html from "/libs/html.js";
import { soundManager } from "/libs/soundManager.js";

let Data = undefined;
let SoundManager = new soundManager();
let audio;

const pkg = {
  name: "Sounds Library",
  svcName: "SfxLib",
  type: "app",
  privs: 0,
  async start(Root) {
    console.log("[SfxLib] Started.");

    let s = await localforage.getItem("settings__bgmSong");
    let sv = await localforage.getItem("settings__soundVolume");
    if (s === null || s === undefined) {
      s = "/assets/audio/bgm_dreamy.mp3";
    }

    const response = await fetch(s);
    const blob = await response.blob();
    audio = new Audio();
    audio.src = URL.createObjectURL(blob);
    audio.loop = true;
    audio.volume = 1;

    window.setVolume = (vol) => (audio.volume = vol);

    // console.log('Loaded Music');
    // console.debug('Loaded Music');
    // console.warn('Loaded Music');
    // console.info('Loaded Music');
    // console.error('Loaded Music');
    // alert('Loaded Music');

    let r = await localforage.getItem("settings__playBgm");

    window.onclick = firstPlay;

    function firstPlay() {
      window.onclick = null;
      if (r === null || r === true) {
        audio.play();
      } else if (r === false) {
        audio.play();
        audio.pause();
      }
    }

    setTimeout(() => {
      firstPlay();
    }, 1000);

    let sfxPack = await localforage.getItem("settings__sfxPack");

    if (sfxPack === null) {
      sfxPack = "/assets/audio/sfx_dreamy.zip";
    }

    console.log("[SfxLib] Loading sounds...");

    await this.data.init(sfxPack);
  },
  data: {
    async store(s) {
      await Promise.all(
        Object.keys(s)
          .filter((s) => s.trim() !== "")
          .map(async (k) => {
            await SoundManager.loadSound(s[k], k);
          })
      );
      console.log("[SfxLib] Loaded new sounds.");
    },
    async init(url = "/assets/audio/sfx_dreamy.zip") {
      // Fetch the audio.zip file
      async function fetchAudioZip() {
        try {
          const response = await fetch(url);
          const blob = await response.blob();

          // Create a new zip file
          const reader = new zip.ZipReader(new zip.BlobReader(blob));

          // Get all the entries in the zip file
          const entries = await reader.getEntries();
          const soundEffects = {}; // Object to store sound effects

          // Iterate over each entry in the zip file
          for (const entry of entries) {
            const name = extractFilename(entry.filename); // Extract the file name
            // Extract the file data as a Blob
            const blob = await entry.getData(new zip.Uint8ArrayWriter());
            soundEffects[name] = blob.buffer; // Add the audio to the soundEffects object with its name
          }

          // Now you can use the soundEffects object
          return { success: true, data: soundEffects };
        } catch (error) {
          // Handle any errors
          return { success: false, data: error };
        }
      }

      // Helper function to extract the filename from its path
      function extractFilename(path) {
        return path.substr(path.lastIndexOf("/") + 1);
      }

      console.log("[SfxLib] Working...");
      const result = await fetchAudioZip();

      if (!result.success) {
        console.log(
          "[SfxLib] Failed to extract sound effects. Error..",
          result.data
        );
        return;
      }

      await this.store(result.data);

      console.log("done loading sfx");
    },
    getAudio: () => audio,
    async changeBgm(s) {
      // await fetch()
      audio.src = s;
      audio.play();
    },
    setVolume: (v) => {
      SoundManager.setVolume(v);
      window.setVolume(v);
    },
    getVolume: (v) => {
      return SoundManager.vol ?? 1;
    },
    // get() {
    //   return Data;
    // },
    // getSfx(s) {
    //   return Data[s];
    // },
    playSfx(s) {
      SoundManager.playSound(s);
      // var s = Data[s];
      // s.pause();
      // s.currentTime = 0;
      // s.play();
    },
  },
  end: async function () {
    // Close the window when the process is exited
    console.log("[SfxLib] Exiting.");
    audio.pause();
  },
};

export default pkg;
