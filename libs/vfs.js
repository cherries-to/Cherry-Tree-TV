// (async () => {

// })
import "/libs/localforage.js";

let templateFsLayout = {
  Root: {
    CherryTree: {
      user: {
        ".token": "",
        "games.json": JSON.stringify({
          last_updated: Date.now(),
          list: [
            {
              name: "Movies & TV",
              color: "hsl(0, 65%, 62%)",
              lastPlayed: Date.now() - 100,
              image:
                "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9IiNmZmZmZmYiIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIiBjbGFzcz0ibHVjaWRlIGx1Y2lkZS10diI+PHJlY3Qgd2lkdGg9IjIwIiBoZWlnaHQ9IjE1IiB4PSIyIiB5PSI3IiByeD0iMiIgcnk9IjIiLz48cG9seWxpbmUgcG9pbnRzPSIxNyAyIDEyIDcgNyAyIi8+PC9zdmc+",
              launchPkg: "apps:Movies&TV",
            },
            {
              name: "YouTube",
              color: "hsl(0, 100%, 55%)",
              lastPlayed: Date.now() - 100,
              image:
                "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIGNsYXNzPSJleHRlcm5hbC1pY29uIiB2aWV3Qm94PSIwIDAgMjguNTcgIDIwIiBmb2N1c2FibGU9ImZhbHNlIiBzdHlsZT0icG9pbnRlci1ldmVudHM6IG5vbmU7IGRpc3BsYXk6IGJsb2NrOyB3aWR0aDogMTAwJTsgaGVpZ2h0OiAxMDAlOyI+CiAgPHN2ZyB2aWV3Qm94PSIwIDAgMjguNTcgMjAiIHByZXNlcnZlQXNwZWN0UmF0aW89InhNaWRZTWlkIG1lZXQiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CiAgICA8Zz4KICAgICAgPHBhdGggZD0iTTI3Ljk3MjcgMy4xMjMyNEMyNy42NDM1IDEuODkzMjMgMjYuNjc2OCAwLjkyNjYyMyAyNS40NDY4IDAuNTk3MzY2QzIzLjIxOTcgMi4yNDI4OGUtMDcgMTQuMjg1IDAgMTQuMjg1IDBDMTQuMjg1IDAgNS4zNTA0MiAyLjI0Mjg4ZS0wNyAzLjEyMzIzIDAuNTk3MzY2QzEuODkzMjMgMC45MjY2MjMgMC45MjY2MjMgMS44OTMyMyAwLjU5NzM2NiAzLjEyMzI0QzIuMjQyODhlLTA3IDUuMzUwNDIgMCAxMCAwIDEwQzAgMTAgMi4yNDI4OGUtMDcgMTQuNjQ5NiAwLjU5NzM2NiAxNi44NzY4QzAuOTI2NjIzIDE4LjEwNjggMS44OTMyMyAxOS4wNzM0IDMuMTIzMjMgMTkuNDAyNkM1LjM1MDQyIDIwIDE0LjI4NSAyMCAxNC4yODUgMjBDMTQuMjg1IDIwIDIzLjIxOTcgMjAgMjUuNDQ2OCAxOS40MDI2QzI2LjY3NjggMTkuMDczNCAyNy42NDM1IDE4LjEwNjggMjcuOTcyNyAxNi44NzY4QzI4LjU3MDEgMTQuNjQ5NiAyOC41NzAxIDEwIDI4LjU3MDEgMTBDMjguNTcwMSAxMCAyOC41Njc3IDUuMzUwNDIgMjcuOTcyNyAzLjEyMzI0WiIgZmlsbD0iI0ZGMDAwMDAwIj48L3BhdGg+CiAgICAgIDxwYXRoIGQ9Ik0xMS40MjUzIDE0LjI4NTRMMTguODQ3NyAxMC4wMDA0TDExLjQyNTMgNS43MTUzM1YxNC4yODU0WiIgZmlsbD0id2hpdGUiPjwvcGF0aD4KICAgIDwvZz4KICA8L3N2Zz4KPC9zdmc+",
              launchPkg: "apps:YouTube",
            },
            {
              name: "File Manager",
              color: "hsl(130, 65%, 62%)",
              lastPlayed: Date.now() - 1_000,
              image:
                "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9IiNmZmZmZmYiIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIiBjbGFzcz0ibHVjaWRlIGx1Y2lkZS1mb2xkZXIiPjxwYXRoIGQ9Ik0yMCAyMGEyIDIgMCAwIDAgMi0yVjhhMiAyIDAgMCAwLTItMmgtNy45YTIgMiAwIDAgMS0xLjY5LS45TDkuNiAzLjlBMiAyIDAgMCAwIDcuOTMgM0g0YTIgMiAwIDAgMC0yIDJ2MTNhMiAyIDAgMCAwIDIgMloiLz48L3N2Zz4=",
              launchPkg: "apps:FileManager",
            },
          ],
        }),
      },
    },
  },
};

const Vfs = {
  // The file system is represented as a nested object, where each key is a folder or file name
  // and the value is either a string (for file contents) or another object (for a subfolder)
  fileSystem: {},
  async save() {
    await localforage.setItem("fs", JSON.stringify(this.fileSystem));
    this.fileSystem = JSON.parse(await localforage.getItem("fs"));
  },
  async exportFS() {
    return this.fileSystem;
  },
  async importFS(fsObject = templateFsLayout) {
    if (fsObject === true) {
      this.fileSystem = templateFsLayout;
    } else if (
      !(await localforage.getItem("fs")) &&
      fsObject === templateFsLayout
    ) {
      this.fileSystem = fsObject;
    } else if (fsObject !== templateFsLayout) {
      this.fileSystem = fsObject;
    } else {
      const existingFs = JSON.parse(await localforage.getItem("fs"));
      this.fileSystem = existingFs;
    }
    this.save();
    return this.fileSystem;
  },
  // Helper function to get the parent folder of a given path
  async getParentFolder(path) {
    const parts = path.split("/");
    parts.pop();
    return parts.join("/");
  },
  // function to tell you if stored data is a file or a folder
  async whatIs(path, fsObject = this.fileSystem) {
    const parts = path.split("/");
    let current = fsObject;
    for (let i = 0; i < parts.length; i++) {
      const part = parts[i];
      if (typeof current[part] === "undefined") {
        return null;
      }
      current = current[part];
    }
    if (typeof current !== "string") {
      return "dir";
    } else {
      return "file";
    }
  },
  // Function to get the contents of a file at a given path
  async readFile(path, fsObject = this.fileSystem) {
    const parts = path.split("/");
    let current = fsObject;
    for (let i = 0; i < parts.length; i++) {
      const part = parts[i];
      if (typeof current[part] === "undefined") {
        return null;
      }
      current = current[part];
    }
    if (typeof current !== "string") {
      return null;
    }
    return current;
  },
  // Function to write to a file at a given path
  async writeFile(path, contents, fsObject = this.fileSystem) {
    const parts = path.split("/");
    const filename = parts.pop();
    let current = fsObject;
    for (let i = 0; i < parts.length; i++) {
      const part = parts[i];
      if (typeof current[part] === "undefined") {
        current[part] = {};
      }
      current = current[part];
    }
    current[filename] = contents;
    this.save();
  },
  // Function to create a new folder at a given path
  async createFolder(path, fsObject = this.fileSystem) {
    const parts = path.split("/");
    const foldername = parts.pop();
    let current = fsObject;
    for (let i = 0; i < parts.length; i++) {
      const part = parts[i];
      if (typeof current[part] === "undefined") {
        current[part] = {};
      }
      current = current[part];
    }
    if (!current[foldername]) current[foldername] = {};
    this.save();
  },
  // Function to delete a file or folder at a given path
  async delete(path, fsObject = this.fileSystem) {
    const parts = path.split("/");
    const filename = parts.pop();
    const parentPath = this.getParentFolder(path);
    let parent = fsObject;
    for (let i = 0; i < parts.length; i++) {
      const part = parts[i];
      if (typeof parent[part] === "undefined") {
        return;
      }
      parent = parent[part];
    }
    delete parent[filename];
    this.save();
  },
  // Function to list all files and folders at a given path
  async list(path, showHidden = false, fsObject = this.fileSystem) {
    const parts = path.split("/");
    let current = fsObject;
    for (let i = 0; i < parts.length; i++) {
      const part = parts[i];
      if (typeof current[part] === "undefined") {
        return null;
      }
      current = current[part];
    }
    const result = (
      await Promise.all(
        Object.keys(current).map(async (m) => {
          if (showHidden === false && m.startsWith(".")) {
            return null;
          }
          return { item: m, type: await this.whatIs(path + "/" + m) };
        })
      )
    ).filter((m) => m !== null);
    return result;
  },
  async exists(path, fsObject = this.fileSystem) {
    const parts = path.split("/");
    let current = fsObject;
    for (let i = 0; i < parts.length; i++) {
      const part = parts[i];
      if (typeof current[part] === "undefined") {
        return false;
      }
      current = current[part];
    }
    return true;
  },
  async merge(fsObject = this.fileSystem) {
    var existingFs = fsObject;

    function mergeFileSystem(obj1, obj2) {
      for (var key in obj2) {
        if (obj2.hasOwnProperty(key)) {
          if (
            typeof obj2[key] === "object" &&
            obj2[key] !== null &&
            !Array.isArray(obj2[key])
          ) {
            if (
              !(key in obj1) ||
              typeof obj1[key] !== "object" ||
              obj1[key] === null ||
              Array.isArray(obj1[key])
            ) {
              obj1[key] = {}; // Create an object if the key doesn't exist or if it is not an object
            }
            mergeFileSystem(obj1[key], obj2[key]); // Recursive call for nested objects
          } else {
            if (!(key in obj1)) {
              obj1[key] = obj2[key]; // Assign the value if the key doesn't exist in obj1
            } else {
              console.log(
                `File "${key}" already exists and will not be overwritten.`
              );
            }
          }
        }
      }
    }

    mergeFileSystem(existingFs, templateFsLayout);
    this.importFS(existingFs);
    // this.save();
  },
};

export default Vfs;
