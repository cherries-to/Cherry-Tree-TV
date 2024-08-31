import Html from "/libs/html.js";

const pkg = {
  name: "Example App",
  svcName: "example",
  type: "app",
  privs: 0,
  start: async function (Root) {
    // Testing
    console.log("Hello from example service.", Root);
  },
  data: {
    async function1() {
      return "The j";
    },
    async function2() {
      return "The k";
    },
    async function3() {
      return "The l";
    },
  },
  end: async function () {
    // nothing
  },
};

export default pkg;
