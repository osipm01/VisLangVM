// nodes/CompareNode.js
import BaseNode from "../vm/node.js";

class CompareNode extends BaseNode {
  constructor(next = null, args = [], context = null) {
    super(next, args, context, "compare");
  }

  execute() {
    const [resultVar, leftVar, rightVar, operator = "=="] = this.args;

    if (!resultVar || !leftVar || !rightVar) {
      throw new Error("CompareNode requires resultVar, leftVar, and rightVar");
    }

    const left = this.getValue(leftVar);
    const right = this.getValue(rightVar);

    let result;
    switch (operator) {
      case "==":
        result = left == right;
        break;
      case "===":
        result = left === right;
        break;
      case "!=":
        result = left != right;
        break;
      case "!==":
        result = left !== right;
        break;
      case "<":
        result = left < right;
        break;
      case "<=":
        result = left <= right;
        break;
      case ">":
        result = left > right;
        break;
      case ">=":
        result = left >= right;
        break;
      default:
        throw new Error(`Unknown operator: ${operator}`);
    }

    this.setValue(resultVar, result);

    if (this.context.debug) {
      console.log(
        `${left} ${operator} ${right} = ${result} stored in ${resultVar}`,
      );
    }
  }
}

export default CompareNode;
