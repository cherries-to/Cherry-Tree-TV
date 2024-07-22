const { app, BrowserWindow } = require("electron");
const nodeDiskInfo = require("node-disk-info");
const { Worker } = require("worker_threads");
const ffmpeg = require("fluent-ffmpeg");
const mime = require("mime-types");
const qrcode = require("qrcode");
const dgram = require("dgram");
const express = require("express");
const path = require("path");
const cors = require("cors");
const fs = require("fs");
const server = express();
const port = 9864;

if (!fs.existsSync("thumbnails/")) {
  fs.mkdirSync("thumbnails");
}

let local_ip = null;
const s = dgram.createSocket("udp4");
s.connect(80, "8.8.8.8", () => {
  local_ip = s.address().address;
  console.log("[SERVER] Fetched local IP");
  s.close();
});

server.use(express.static("static"));
server.use(express.json());
server.use(cors());

const createWindow = () => {
  const win = new BrowserWindow({
    width: 1280,
    height: 720,
    icon: "icon.png",
    autoHideMenuBar: true,
  });

  win.loadURL(`http://127.0.0.1:${port}/index.html`);
};

app.whenReady().then(() => {
  server.get("/local_ip", (req, res) => {
    res.send(local_ip);
  });
  server.get("/qr", (req, res) => {
    qrcode.toDataURL(req.query["url"], (err, url) => {
      const buffer = Buffer.from(url.split(",")[1], "base64");
      res.setHeader("content-type", "image/png");
      res.send(buffer);
    });
  });
  server.get("/thumbnail", (req, res) => {
    const fPath = req.query.path;
    const worker = new Worker("./thumbnailer.js", {
      workerData: { vidPath: fPath },
    });
    worker.on("message", (data) => {
      console.log(data);
      if (data.success) {
        res.sendFile(data.path, { root: __dirname });
      } else {
        res.send(500).send({ error: true, error_msg: data.error_msg });
      }
    });
    worker.on("error", (msg) => {
      res.status(500).send({ error: true, error_msg: msg });
    });
  });
  server.get("/drives", (req, res) => {
    console.log("[FILE] Requesting drives");
    nodeDiskInfo
      .getDiskInfo()
      .then((disks) => {
        let driveNames = [];
        disks.forEach((disk) => {
          driveNames.push(disk.mounted);
        });
        res.json(driveNames);
      })
      .catch((reason) => {
        res.status(500).send(reason);
      });
  });
  server.post("/list", (req, res) => {
    const dir = req.body.dir;
    console.log("[FILE] Requested directory:", dir);

    if (!dir) {
      return res
        .status(400)
        .json({ error: true, error_msg: "Please provide a directory path!" });
    }

    fs.stat(dir, (err, stats) => {
      if (err) {
        return res
          .status(400)
          .json({ error: true, error_msg: "Error accessing directory!" });
      }

      if (stats.isFile()) {
        return res
          .status(400)
          .json({ error: true, error_msg: "This is a file!" });
      }

      fs.readdir(dir, async (err, files) => {
        if (err) {
          return res
            .status(400)
            .json({ error: true, error_msg: "Error reading directory!" });
        }

        const respData = [];
        for (const file of files) {
          const filePath = path.join(dir, file);
          try {
            const fileStats = await fs.promises.stat(filePath);
            respData.push({
              name: file,
              type: fileStats.isFile() ? "file" : "folder",
              created: new Date(fileStats.ctime).getTime(),
              modified: new Date(fileStats.mtime).getTime(),
            });
          } catch (error) {
            console.error(`Error reading file ${file}: ${error.message}`);
          }
        }

        res.json(respData);
      });
    });
  });
  server.get("/getFile", (req, res) => {
    const fPath = req.query.path;
    console.log("[FILE] Requested file:", fPath);

    if (!fPath) {
      return res
        .status(400)
        .json({ error: true, error_msg: "Please provide a file path!" });
    }

    fs.stat(fPath, (err, stats) => {
      if (err) {
        return res
          .status(400)
          .json({ error: true, error_msg: "Error accessing file!" });
      }

      if (stats.isDirectory()) {
        return res
          .status(400)
          .json({ error: true, error_msg: "This is a directory!" });
      }

      const mimeType = mime.lookup(fPath);
      if (!mimeType) {
        return res
          .status(400)
          .json({ error: true, error_msg: "Unknown file type!" });
      }

      res.sendFile(fPath, { headers: { "Content-Type": mimeType } });
    });
  });
  server.use(express.static("public"));
  server.listen(port, () => {
    console.log(`[SERVER] Cherry Tree server listening on port ${port}`);
    createWindow();
  });
});
