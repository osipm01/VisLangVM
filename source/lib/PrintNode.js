// nodes/PrintNode.js
import BaseNode from "../vm/node.js";

class PrintNode extends BaseNode {
  constructor(next = null, args = [], context = null) {
    super(next, args, context, "print");
  }

  execute() {
    const varName = this.args[0];
    if (!varName) {
      console.log("undefined");
      return;
    }

    const value = this.getValue(varName);
    console.log(`${varName} =`, value);
  }
}

export default PrintNode;
