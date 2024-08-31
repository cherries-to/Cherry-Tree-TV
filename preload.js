const { contextBridge, ipcRenderer } = require("electron");
contextBridge.exposeInMainWorld("desktopIntegration", {
  ipc: {
    send: (channel, data) => {
      ipcRenderer.send(channel, data);
    },
    on: (channel, callback) => {
      ipcRenderer.on(channel, callback);
    }
  }
});
