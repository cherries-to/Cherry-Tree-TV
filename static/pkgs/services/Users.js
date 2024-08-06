let ws,
  token,
  root,
  friendList = [];

const pkg = {
  name: "User",
  svcName: "UserSvc",
  type: "svc",
  privs: 0,
  start: async function (Root) {
    console.log("Hello from example service.", Root);
    root = Root;
    // initializing the websocket connection
  },
  data: {
    async login(username, password) {
      let result = await fetch("https://tree.cherries.to/api/v1/user/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      return await result.json();
    },
    async register(username, password, email) {
      let result = await fetch(
        "https://tree.cherries.to/api/v1/user/register",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ username, password, email }),
        }
      );
      return await result.json();
    },
    getFriendList: (_) => friendList,
    async subscribe(authToken) {
      return new Promise((resolve, reject) => {
        token = authToken;

        let messageResponses = {};

        const sendMessage = async (msg) => {
          return new Promise((resolve, reject) => {
            const messageId = `${performance.now()}-${Math.random()}`;

            ws.send(JSON.stringify({ ...msg, id: messageId }));

            messageResponses[messageId] = resolve;
          });
        };

        const ws = new WebSocket(
          `wss://tree.cherries.to/subscribe?auth=${encodeURIComponent(
            authToken
          )}`
        );

        window.POLL_INTERVAL = setInterval(() => {
          ws.send('{"type":"ping"}');
        }, 20000);

        function isJson(str) {
          try {
            JSON.parse(str);
          } catch (e) {
            return false;
          }
          return true;
        }

        ws.addEventListener("message", (e) => {
          try {
            const s = JSON.parse(e.data);
            if (s.type !== undefined) {
              console.log(s);
              document.dispatchEvent(
                new CustomEvent("CherryTree.WebSocket.Message", {
                  detail: s,
                })
              );
              if (s.id) {
                const responseId = s.id;
                if (messageResponses[responseId]) {
                  console.log("Found a message response", s);
                  messageResponses[responseId](s);
                  delete messageResponses[responseId];
                }
              } else if (s.type === "friend-list-update") {
                // Urgent
                let i = friendList.findIndex((f) => f.id === s.data.id);
                if (friendList[i]) {
                  friendList[i] = s.data;
                } else {
                  friendList.push(s.data);
                }
              } else if (s.type === "now-online") {
                if (s.data.name) {
                  root.Libs.Notify.show(
                    "Friend online",
                    `${s.data.name} is now online!`
                  );
                }
              } else if (s.type === "message") {
                root.Libs.Notify.show(s.data.title, s.data.description);
              } else if (s.type === "error" && s.reason) {
                if (s.reason === "SocketClosedBadJwt") {
                  // Somehow callback with false ?
                  reject("The server broke your promise, we're sorry 😔");
                }
              }
            }
          } catch (e) {}
        });

        ws.onerror = (_) => {
          console.log("[ws] error");
          resolve({ result: false, data: ws, sendMessage });
        };

        ws.onopen = (_) => {
          console.log("[ws] open");
          console.log("[ws]", ws);
          resolve({ result: true, data: ws, sendMessage });
        };

        ws.onclose = (_) => {
          console.log("[ws] CLOSED!");
        };
      });
    },
    async getUserInfo(token) {
      try {
        let result = await fetch(
          "https://tree.cherries.to/api/v1/user/profile",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        return await result.json();
      } catch (e) {
        return false;
      }
    },
    async validateJwt(token) {
      try {
        let result = await fetch(
          "https://tree.cherries.to/api/v1/validate_jwt",
          {
            mode: "no-cors",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        )
          .then((j) => j.json())
          .catch(undefined);
        return result;
      } catch (e) {
        return false;
      }
    },
  },
  end: async function () {
    // Close the window when the process is exited
  },
};

export default pkg;
