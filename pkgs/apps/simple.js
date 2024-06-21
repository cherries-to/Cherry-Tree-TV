// Simplest possible package
const pkg = {
  name: "Simple",
  type: "app",
  privs: 0,
  start: async function (Root) {
    console.log("Hi!");
  },
  end: async function () {
    console.log("Bye!");
  },
};

export default pkg;
