// nodes/ExitNode.js
import BaseNode from "../vm/node.js";

class ExitNode extends BaseNode {
  constructor(next = null, args = [], context = null) {
    super(next, args, context, "exit");
  }

  execute() {
    if (this.context.debug) {
      console.log("Exit node executed");
    }
    // Ничего не делаем, просто сигнализируем о выходе
  }
}

export default ExitNode;
