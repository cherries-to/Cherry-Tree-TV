import Html from "/libs/html.js";
import { timeDifference } from "/libs/time.js";
import vfs from "/libs/vfs.js";
import LangManager from "../../libs/l10n/manager.js";

let wrapper;

const pkg = {
  name: "Main Menu",
  type: "app",
  privs: 0,
  start: async function (Root) {
    // Get the window body
    wrapper = new Html("div").class("ui", "main-menu").appendTo("body");
    const Sfx = Root.Processes.getService("SfxLib").data;
    const User = Root.Processes.getService("UserSvc").data;
    const Ui = Root.Processes.getService("UiLib").data;

    let currentMenuList;

    Ui.becomeTopUi(Root.Pid, wrapper);

    let ws = Root.Security.getSecureVariable("CHERRY_TREE_WS");

    let stepCount = 0;
    function logStep(reason = "Step") {
      stepCount++;
      console.log("[MainMenu]", stepCount + ":", reason);
    }

    let uFriendList = User.getFriendList() || [];

    logStep("MAIN MENU LOADED");

    let friendsList = [];
    let info = {
      id: -1,
      name: "Not logged in",
      extra: null,
    };
    if (ws) {
      logStep("There is a WebSocket detected");
      friendsList = (await ws.sendMessage({ type: "get-friends" })).result;
      info = await User.getUserInfo(await Root.Security.getToken());
      logStep("Websocket message received");
    } else {
      logStep("No WebSocket detected");
    }

    document.addEventListener("CherryTree.WebSocket.Message", (e) => {
      let s = e.detail;
      console.log("WS message on MainMenu", s);
      if (s.type === "watchParty") {
        console.log(s);
        let parsedData = JSON.parse(s.text);
        Root.Libs.Notify.show(
          `${s.from.name} is hosting a watch party!`,
          `Press the %menu% button to handle the invite.`,
          "menu",
          async () => {
            let userResult = await Root.Libs.Modal.Show({
              title: "Watch Party Invite",
              description: `${s.from.name} has invited you to watch\n ${parsedData.name}`,
              parent: document.body,
              pid: await ui.data.getTopUi(),
              buttons: [
                { type: "default", text: "Accept" },
                { type: "default", text: "Ignore" },
              ],
            });
            console.log(userResult);
            if (!userResult.cancelled) {
              const accepted = userResult.id === 0 ? true : false;
              if (accepted) {
                await Root.Libs.startPkg(
                  "apps:VideoPlayer",
                  [
                    {
                      app: "video",
                      watchParty: true,
                      partyCode: parsedData.partyId,
                      partyName: parsedData.name,
                    },
                  ],
                  true
                );
              }
            }
          }
        );
      }
    });

    await vfs.importFS();

    logStep("FileSystem loaded");

    async function giveUpToApp(launchPkg, launchArgs = undefined) {
      Sfx.playSfx("deck_ui_into_game_detail.wav");

      let split = launchPkg.split(":");
      let url = `/pkgs/${split[0]}/${split[1]}.js`;
      let data = await import(url);

      if (data.default) {
        try {
          ws.sendMessage({ type: "now-playing", message: data.default.name });
        } catch (e) {}
      }

      // Ui.cleanup(Pid);
      Ui.transition("popOut", wrapper, 500, true);
      // await Ui.giveUpUi(Root.Pid);
      // await Ui.giveUpUi(Root.Pid);
      // // await Ui.transition("popOut", wrapper, 500, true);
      // wrapper.classOn("popOut");
      await Root.Libs.startPkg(launchPkg, launchArgs);
    }

    let gameListData = JSON.parse(
      await vfs.readFile("Root/CherryTree/user/games.json")
    );

    if (gameListData === null) {
      // Attempt refresh of VFS to get a default gameListData.
      await vfs.merge();
      gameListData = JSON.parse(
        await vfs.readFile("Root/CherryTree/user/games.json")
      );
    }

    const gamesList = gameListData.list;

    let gamesListHtml = gamesList.map((m) => {
      return new Html("button")
        .class("game")
        .styleJs({
          background: m.color,
          backgroundPosition: "center",
          backgroundSize: "45%",
          backgroundRepeat: "no-repeat",
          backgroundImage: `url("${m.image}")`,
        })
        .on("click", async (e) => {
          if (m.launchPkg) {
            await giveUpToApp(m.launchPkg, m.launchArgs);
          } else if (m.launchUrl) {
            // Click the URL.
            let x = new Html("a")
              .attr({ href: m.launchUrl })
              .class("hidden")
              .appendTo("body");
            x.elm.click();
            setTimeout(() => {
              x.cleanup();
            });
          }
        })
        .appendMany(
          new Html("span")
            .class("game-under-text")
            .appendMany(
              new Html("span").class("game-name").text(m.name),
              new Html("span")
                .class("game-play-time")
                .text("last played " + timeDifference(new Date(), m.lastPlayed))
            )
        );
    });

    let topBarButtonList = [
      { label: LangManager.getString("menu.apps") },
      { label: LangManager.getString("menu.store") },
      { label: LangManager.getString("menu.more") },
    ];

    let topBarButtons = topBarButtonList.map((button) => {
      return new Html("a").class("btn").text(button.label);
    });

    // let friendsCount = new Html("label").class("friends-count").text("0");
    // topBarButtons[1].append(friendsCount);

    const topBar = new Html("div")
      .class("main-menu-container")
      .appendMany(
        new Html("div")
          .class("left")
          .appendMany(
            new Html("div")
              .class("logo")
              .html(
                `<svg width="64" height="64" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg"><g clip-path="url(#clip0_448_25)"><path d="M46.2205 42.6667C45.8685 42.6667 45.5147 42.5618 45.2036 42.3449C33.5716 34.2027 23.5752 20.3609 17.8312 11.3422C20.8516 30.0587 19.6036 40.6009 19.5414 41.1093C19.4205 42.0836 18.5423 42.7627 17.5592 42.6525C16.5849 42.5316 15.8934 41.6445 16.0143 40.6702C16.0303 40.5298 17.6783 26.3893 12.4836 2.14935C12.2969 1.28357 12.7787 0.410681 13.6107 0.108459C14.4392 -0.197319 15.3725 0.158236 15.7903 0.940459C15.9307 1.20357 30.0249 27.3813 47.2409 39.4329C48.0463 39.9947 48.2401 41.104 47.6783 41.9076C47.3334 42.4036 46.7823 42.6667 46.2205 42.6667Z" fill="#77B255"/><path d="M47.1947 15.6765C41.0152 17.3831 38.2152 20.2027 28.0854 16.8622C19.6943 14.0942 15.5752 9.38312 16.8054 5.65334C18.0356 1.92356 22.4587 0.0302287 30.8499 2.79823C39.2925 5.58401 38.1796 8.96001 47.1947 15.6765Z" fill="#5C913B"/><path d="M46.2222 64C54.0769 64 60.4444 57.6325 60.4444 49.7778C60.4444 41.923 54.0769 35.5555 46.2222 35.5555C38.3675 35.5555 32 41.923 32 49.7778C32 57.6325 38.3675 64 46.2222 64Z" fill="#BE1931"/><path d="M19.5555 64C27.4102 64 33.7777 57.6325 33.7777 49.7778C33.7777 41.923 27.4102 35.5555 19.5555 35.5555C11.7008 35.5555 5.33325 41.923 5.33325 49.7778C5.33325 57.6325 11.7008 64 19.5555 64Z" fill="#BE1931"/></g><defs><clipPath id="clip0_448_25"><rect width="64" height="64" fill="white"/></clipPath></defs></svg>`
              ),
            new Html("div").class("buttons").appendMany(...topBarButtons)
          )
        // new Html("div").class("right").appendMany(
        //   new Html("div")
        //     .class("icon", "gamepad-indicator")
        //     .html(
        //       `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-gamepad-2"><line x1="6" x2="10" y1="11" y2="11"/><line x1="8" x2="8" y1="9" y2="13"/><line x1="15" x2="15.01" y1="12" y2="12"/><line x1="18" x2="18.01" y1="10" y2="10"/><path d="M17.32 5H6.68a4 4 0 0 0-3.978 3.59c-.006.052-.01.101-.017.152C2.604 9.416 2 14.456 2 16a3 3 0 0 0 3 3c1 0 1.5-.5 2-1l1.414-1.414A2 2 0 0 1 9.828 16h4.344a2 2 0 0 1 1.414.586L17 18c.5.5 1 1 2 1a3 3 0 0 0 3-3c0-1.545-.604-6.584-.685-7.258-.007-.05-.011-.1-.017-.151A4 4 0 0 0 17.32 5z"/></svg>`
        //     )
        //     .style({ color: "var(--current-player)" }),
        //   new Html("span")
        //     .class("title")
        //     // .styleJs({
        //     //   border: "4px solid #114499",
        //     //   borderRadius: "8px",
        //     //   padding: "8px",
        //     // })
        //     .text(info.name)
        // )
      )
      .appendTo(wrapper);

    // const container = new Html("div").class('main-menu-attached').style({'width':'100%'}).appendTo(wrapper);

    const gameList = new Html("div")
      .class("flex-row", "game-list")
      .appendTo(wrapper)
      .appendMany(...gamesListHtml);

    const topBarBtnHtml = topBarButtons.map((m) => m.elm);

    let moreButtonsFirstRow = new Html("div").class("flex-row").appendMany(
      new Html("button").text("Open Settings").on("click", async (e) => {
        await giveUpToApp("apps:Settings");
      })
    );

    const moreList = new Html("div")
      .class("home-menu-section", "main-menu-attached", "flex-col")
      .appendMany(moreButtonsFirstRow)
      .appendTo(wrapper);

    console.log(friendsList);

    let friendListWrapper = new Html("div").class("flex-list");

    let friendListHtml = [],
      incomingFriendListHtml = [],
      outgoingFriendListHtml = [];

    let friendListWrapperWrapper, outgoingFriendList, incomingFriendList;

    new Html("h1").text("Friends").appendTo(moreList);

    const friendList = new Html("div").class("flex-col").appendTo(moreList);

    function rerenderFriends() {
      friendListHtml = [];
      incomingFriendListHtml = [];
      outgoingFriendListHtml = [];

      let mergedFriends = friendsList.map((usr) => {
        uFriendList.forEach((uUsr) => {
          if (usr.id === uUsr.id) {
            usr.status = uUsr.data.status;
          }
        });
        return usr;
      });

      console.log(uFriendList, friendsList);

      const updatedFriends = mergedFriends.sort((friendA, friendB) => {
        // Sort name (a-z) for each case
        const nameA = friendA.data?.name || "";
        const nameB = friendB.data?.name || "";
        return nameA.localeCompare(nameB);
      });

      // friendsCount.text(mergedFriends.filter((u) => u.status === 1).length);

      console.log(updatedFriends);

      if (updatedFriends.length > 0) {
        friendListHtml.push(
          ...updatedFriends.map((f) => {
            let label, button;

            // console.log("Friend", f);

            button = new Html("button")
              .class("auto", "flex-col", "transparent")
              .appendMany(
                new Html("div")
                  .class("flex-list", "flex-center")
                  .style({
                    width: "12.5rem",
                    height: "12.5rem",
                    background: `var(--controller-color-${f.id % 5})`,
                    "border-radius": "0.15rem",
                  })
                  .append(
                    new Html("span")
                      .style({
                        "background-color": "rgba(0,0,0,0.5)",
                        width: "100%",
                        height: "100%",
                        display: "flex",
                        "justify-content": "center",
                        "align-items": "center",
                        "font-size": "2.5rem",
                        flex: "1",
                      })
                      .text(f.id)
                  ),
                new Html("span").class("title").text(f.name)
              );

            // console.log(f);

            // if (f.lastOnline) {
            //   label = new Html("label").text(
            //     `last online ${timeDifference(
            //       new Date(),
            //       new Date(f.lastOnline)
            //     )}`
            //   );
            // }
            // if (f.type) {
            // if (f.type === "incoming" || f.type === "outgoing") {
            //   label = new Html("label").text(f.type);
            // } else {

            label = new Html("label").text(
              `last online ${timeDifference(
                new Date(),
                new Date(f.lastOnline)
              )}`
            );

            if (f.status === 1) {
              label.classOn("positive-text").text("online");
            }

            label.appendTo(button);

            return button;
          })
        );
      }

      // Outgoing friend list support
      outgoingFriendListHtml.push(
        ...uFriendList
          .filter((f) => f.type === "outgoing")
          .map((f, n) => {
            console.log("Outgoing friend request", f);
            return new Html("button")
              .class("auto", "flex-col", "transparent")
              .appendMany(
                new Html("div")
                  .class("flex-list", "flex-center")
                  .style({
                    width: "12.5rem",
                    height: "12.5rem",
                    background: `var(--controller-color-${f.id % 5})`,
                    "border-radius": "0.15rem",
                  })
                  .append(new Html("span").style({ flex: "1" }).text(f.id)),
                new Html("span").class("title").text(f.data.name),
                new Html("label").text(
                  `last online ${timeDifference(
                    new Date(),
                    new Date(f.data.lastOnline)
                  )}`
                )
              );
          })
      );

      // Incoming friend list support
      incomingFriendListHtml.push(
        ...uFriendList
          .filter((f) => f.type === "incoming")
          .map((f, n) => {
            return new Html("button")
              .class("auto", "flex-col", "transparent")
              .appendMany(
                new Html("div")
                  .class("flex-list", "flex-center")
                  .style({
                    width: "12.5rem",
                    height: "12.5rem",
                    background: `var(--controller-color-${f.id % 5})`,
                    "border-radius": "0.15rem",
                  })
                  .append(new Html("span").style({ flex: "1" }).text(f.id)),
                new Html("span").class("title").text(f.data.name),
                new Html("label").text(`wants to be your friend`)
              )
              .on("click", async (e) => {
                let result = await Root.Libs.Modal.Show({
                  title: `Friend request ${
                    f.type === "incoming" ? "from" : "to"
                  } ${f.data.name}`,
                  description: "What do you want to do?",
                  pid: Root.Pid,
                  parent: document.body,
                  buttons: [
                    { type: "positive", text: "Accept" },
                    { type: "negative", text: "Deny" },
                    { type: "primary", text: "Cancel" },
                  ],
                });

                let choice = result.id;

                if (choice === 0) {
                  // Accept
                  let response = (
                    await ws.sendMessage({
                      type: "accept-friend-request",
                      message: String(f.id),
                    })
                  ).result;

                  console.log(response);
                } else if (choice === 1) {
                  // Deny
                  let response = (
                    await ws.sendMessage({
                      type: "reject-friend-request",
                      message: String(f.id),
                    })
                  ).result;

                  console.log(response);
                }
              });
          })
      );

      if (incomingFriendListHtml.length === 0) {
        incomingFriendListHtml = [
          new Html("button").class("invisible").text("Nothing to see here.."),
        ];
      }
      if (outgoingFriendListHtml.length === 0) {
        outgoingFriendListHtml = [
          new Html("button").class("invisible").text("Nothing to see here.."),
        ];
      }

      friendListHtml.unshift(
        new Html("button")
          .class("auto", "flex-col", "transparent")
          .styleJs({ alignSelf: "flex-start" })
          .appendMany(
            new Html("div")
              .class("flex-list", "flex-center")
              .styleJs({
                width: "12.5rem",
                height: "12.5rem",
                borderRadius: "0.15rem",
              })
              .html(
                `<svg style="width: 8rem;height: 8rem;" width="200" height="200" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M0 100C0 44.7715 44.7715 0 100 0V0C155.228 0 200 44.7715 200 100V100C200 155.228 155.228 200 100 200V200C44.7715 200 0 155.228 0 100V100Z" fill="#2E2C3A"/>
                    <path d="M68.5 100H131.5" stroke="white" stroke-width="11" stroke-linecap="round" stroke-linejoin="round"/>
                    <path d="M100 68.5V131.5" stroke="white" stroke-width="11" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>`
              ),
            new Html("span").class("title").text("Add Friend")
          )
          .on("click", async (e) => {
            let options = {
              title: "Add a Friend",
              description: "Enter your friend's Cherries account name",
              parent: document.body,
              pid: Root.Pid,
              value: "",
              type: "text",
            };

            let result = (await Root.Libs.Modal.showKeyboard(options)).value;

            let data = await ws.sendMessage({
              type: "send-friend-request",
              message: result,
            });
          })
      );
      // }

      if (friendListWrapperWrapper !== undefined) {
        friendListWrapperWrapper.cleanup();
        outgoingFriendList.cleanup();
        incomingFriendList.cleanup();
      }

      friendListWrapper.html("").appendMany(...friendListHtml);

      friendListWrapperWrapper = new Html("div")
        .class("home-menu-section", "flex-col")
        .appendMany(friendListWrapper)
        .appendTo(friendList);

      outgoingFriendList = new Html("div")
        .class("flex-col")
        .appendMany(
          new Html("h1").class("title").text("outgoing friend requests"),
          new Html("div")
            .class("flex-list")
            .appendMany(...outgoingFriendListHtml)
        )
        .appendTo(friendList);

      incomingFriendList = new Html("div")
        .class("flex-col")
        .appendMany(
          new Html("h1").class("title").text("incoming friend requests"),
          new Html("div")
            .class("flex-list")
            .appendMany(...incomingFriendListHtml)
        )
        .appendTo(friendList);

      currentMenuList = [
        friendListWrapper.elm.children,
        outgoingFriendListHtml,
        incomingFriendListHtml,
      ];
    }

    rerenderFriends();

    // const buttonList = new Html("div")
    //   .class("flex-row", "home-menu-section")
    //   .appendTo(wrapper)
    //   .appendMany(
    //     new Html("button").text("Refresh page").on("click", (e) => {
    //       location.reload();
    //     })
    //     // new Html("button")
    //     //   .text("Exit main menu (??)")
    //     //   .on("click", async (e) => {
    //     //     Ui.cleanup(Root.Pid);
    //     //     await Ui.transition("popOut", wrapper);
    //     //     Ui.giveUpUi(Root.Pid);
    //     //     wrapper.cleanup();
    //     //     this.end();
    //     //   })
    //   );

    // let y1Tabs = [
    //   gameList.elm.children,
    //   friendListWrapper.elm.children,
    //   moreList.elm.children,
    // ];

    function showTabs(x) {
      switch (x) {
        case 0:
          // Show games list
          gameList.classOff("hidden");
          // friendList.classOn("hidden");
          moreList.classOn("hidden");
          break;
        case 1:
          // Show friend list
          gameList.classOn("hidden");
          // friendList.classOff("hidden");
          moreList.classOn("hidden");
          break;
        case 2:
          // Show friend list
          gameList.classOn("hidden");
          // friendList.classOn("hidden");
          moreList.classOff("hidden");
          break;
      }
    }

    const lastXPositions = [0, 0, 0];

    let curY = 0;
    let lastY = 0;
    let justOnTabs = false;
    let selectedTab = 0;
    let lastSelectedTab = 0;
    // let lastSelectedTabInTabList = 0;
    // let actualSelectedTab = 0;

    showTabs(0);

    currentMenuList = [gameList.elm.children];

    let uiArrays = [
      topBarBtnHtml,
      ...currentMenuList,
      // buttonList.elm.children,
    ];

    Ui.transition("popIn", wrapper);

    let lastX;

    Ui.init(
      Root.Pid,
      "horizontal",
      [topBarBtnHtml, ...currentMenuList],
      async function parentCallback(n) {
        // This is called after the input
        lastY = n.y;
        let curX = n.x;

        if (lastY !== curY) {
          if (lastY === 0) {
            if (selectedTab !== curX) {
              Ui.updatePos(Root.Pid, { x: selectedTab, y: 0 });
            }

            curX = selectedTab;

            console.log("Moved up to top tab?", selectedTab);
          }
        }
        curY = n.y;
        if (curY === 0) {
          if (lastSelectedTab !== curX) {
            Sfx.playSfx("deck_ui_tab_transition_01.wav");
            selectedTab = curX;
          }
          lastSelectedTab = selectedTab;

          topBarBtnHtml.forEach((c) => c.classList.remove("selected"));
          topBarBtnHtml[selectedTab].classList.add("selected");

          uiArrays = [topBarBtnHtml];

          if (selectedTab === 0) {
            uiArrays[1] = gameList.elm.children;
          } else if (selectedTab === 2) {
            // Agh
            uFriendList = User.getFriendList();
            rerenderFriends();
            uiArrays = [
              topBarBtnHtml,
              moreButtonsFirstRow.elm.children,
              friendListWrapper.elm.children,
              outgoingFriendListHtml.map((m) => m.elm),
              incomingFriendListHtml.map((m) => m.elm),
            ];
          }
          showTabs(selectedTab);
          Ui.update(Root.Pid, uiArrays);
        } else {
          lastXPositions[selectedTab] = curX;
        }
      }
    );
  },
  end: async function () {
    // Close the window when the process is exited
    wrapper.cleanup();
  },
};

export default pkg;
