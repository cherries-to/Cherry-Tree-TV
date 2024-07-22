const ffmpeg = require("fluent-ffmpeg");
const mime = require("mime-types");
const path = require("path");
const fs = require("fs");

ffmpeg.setFfmpegPath("bin/ffmpeg.exe");
ffmpeg.setFfprobePath("bin/ffprobe.exe");

const { workerData, parentPort } = require("worker_threads");

const fPath = workerData.vidPath;
const fName = path.basename(fPath);
console.log("[FILE] Requested file:", fPath);

if (!fPath) {
  parentPort.postMessage({
    success: false,
    error_msg: "Please provide file path.",
  });
  return;
}

fs.stat(fPath, (err, stats) => {
  if (err) {
    parentPort.postMessage({
      success: false,
      error_msg: "Error accessing file!",
    });
    return;
  }

  if (stats.isDirectory()) {
    parentPort.postMessage({
      success: false,
      error_msg: "This is a directory.",
    });
    return;
  }

  const mimeType = mime.lookup(fPath);
  if (!mimeType) {
    parentPort.postMessage({ success: false, error_msg: "Unknown mime type" });
    return;
  }

  if (!mimeType.includes("video")) {
    parentPort.postMessage({
      success: false,
      error_msg: "File must be a video",
    });
    return;
  }

  if (fs.existsSync(`thumbnails/${fName}.png`)) {
    parentPort.postMessage({ success: true, path: `thumbnails/${fName}.png` });
    return;
  }

  new ffmpeg(fPath)
    .on("end", () => {
      fs.rename("thumbnails/tn.png", `thumbnails/${fName}.png`, () => {
        parentPort.postMessage({
          success: true,
          path: `thumbnails/${fName}.png`,
        });
        return;
      });
    })
    .on("error", function (err, stdout, stderr) {
      console.log("Cannot process video: " + err.message);
    })
    .takeScreenshots(
      {
        count: 1,
        timemarks: ["50%"], // number of seconds
      },
      "thumbnails"
    );
});
