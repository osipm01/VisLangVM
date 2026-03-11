// nodes/AssignNode.js
import BaseNode from "../vm/node.js";

class AssignNode extends BaseNode {
  constructor(next = null, args = [], context = null) {
    super(next, args, context, "assign");
  }

  execute() {
    const [varName, value] = this.args;

    if (!varName) {
      throw new Error("AssignNode requires variable name");
    }

    // Если значение передано напрямую
    if (value !== undefined) {
      this.setValue(varName, value);
    }
    // Если значение нужно получить из другой переменной
    else if (this.args.length === 2 && typeof this.args[1] === "string") {
      const sourceValue = this.getValue(this.args[1]);
      this.setValue(varName, sourceValue);
    }

    if (this.context.debug) {
      console.log(`Assigned ${varName} =`, this.getValue(varName));
    }
  }
}

export default AssignNode;
