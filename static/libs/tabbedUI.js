import Html from "./html.js";

class TabbedUI {
  constructor(obj) {
    let tabs = obj.tabs;
    let wrapper = obj.wrapper;
    let Ui = obj.ui;
    let Sfx = obj.sfx;
    let callback = obj.callback;
    let Pid = obj.pid;

    wrapper.styleJs({
      display: "flex",
      gap: "25px",
      alignItems: "center",
      justifyContent: "center",
      flexDirection: "row",
    });

    let tabsList = new Html("div")
      .styleJs({
        height: "75%",
        width: "max-content",
        display: "flex",
        flexDirection: "column",
        backgroundColor: "var(--background-light)",
        borderRadius: "5px",
      })
      .appendTo(wrapper);

    let tabContents = new Html("div")
      .styleJs({
        height: "75%",
        width: "75%",
        display: "flex",
        flexDirection: "column",
        backgroundColor: "var(--background-light)",
        borderRadius: "5px",
      })
      .appendTo(wrapper);

    let tabButtons = [];
    let tabContentButtons = [];

    let uiFuncs = {
      add: (elm) => {
        tabContentButtons.push(elm);
        console.log("Added to list", tabContentButtons);
      },
      update: (elms) => {
        tabContentButtons = elms;
        console.log("Updated element list", tabContentButtons);
      },
    };

    let first;

    Object.keys(tabs).forEach((tab) => {
      if (!first) {
        first = tab;
      }
      let tabDiv = new Html("div").appendTo(tabsList).styleJs({
        width: "100%",
        height: "4rem",
      });
      let tabElement = new Html("button").styleJs({
        width: "100%",
        height: "100%",
        textAlign: "left",
      });
      tabElement.on("click", () => {
        tabContents.clear();
        tabContentButtons = [];
        tabs[tab](tabContents, uiFuncs);
      });
      tabElement.text(tab);
      tabElement.appendTo(tabDiv);
      tabButtons.push(tabDiv.elm.children);
    });

    let focusedOnTab = false;
    let prevValue = 0;
    let hoverValue = 0;

    function handleTabFocus(e) {
      console.log(e);
      console.log(prevValue);
      if (!focusedOnTab) {
        hoverValue = e.y;
      }
      if (
        focusedOnTab == false &&
        e.x === 0 &&
        prevValue == 0 &&
        e.button == "right"
      ) {
        Ui.update(Pid, tabContentButtons);
        Ui.updateParentCallback(handleTabFocus);
        focusedOnTab = true;
      } else if (
        focusedOnTab == true &&
        e.x === 0 &&
        prevValue == 0 &&
        e.button == "left"
      ) {
        Ui.update(Pid, tabButtons);
        Ui.updateParentCallback(handleTabFocus);
        Ui.updatePos(Pid, { x: 0, y: hoverValue });
        focusedOnTab = false;
      } else {
        Sfx.playSfx(window.uiInfo[Pid].customSfx.hover);
      }
      prevValue = e.x;
      callback(e);
      return false;
    }

    tabContents.clear();
    tabContentButtons = [];
    tabs[first](tabContents, uiFuncs);

    Ui.init(Pid, "horizontal", tabButtons, handleTabFocus);
  }
}

export default TabbedUI;
