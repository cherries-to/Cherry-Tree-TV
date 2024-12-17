class CustomInput {
  #registered = false;
  constructor(obj) {
    this.remote = obj;
  }
  register() {
    if (!this.#registered) {
      this.#registered = true;
      document.dispatchEvent(
        new CustomEvent("CherryTree.Remote.RegisterCustom", {
          detail: this.remote,
        }),
      );
    } else {
      console.error("Control already registered, destroy to re-register");
    }
  }
  destroy() {
    if (this.#registered) {
      document.dispatchEvent(
        new CustomEvent("CherryTree.Remote.DestroyCustom"),
      );
      this.#registered = false;
    } else {
      console.error("Control not registered yet, nothing to destroy");
    }
  }
}

export default CustomInput;
