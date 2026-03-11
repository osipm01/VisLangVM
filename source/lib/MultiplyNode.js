// nodes/MultiplyNode.js
import BaseNode from "../vm/node.js";

class MultiplyNode extends BaseNode {
  constructor(next = null, args = [], context = null) {
    super(next, args, context, "multiply");
  }

  execute() {
    const [resultVar, leftVar, rightVar] = this.args;

    if (!resultVar || !leftVar || !rightVar) {
      throw new Error("MultiplyNode requires resultVar, leftVar, and rightVar");
    }

    // Получаем левое значение (всегда из переменной)
    const left = this.getValue(leftVar) || 0;

    // Правое значение может быть либо числом, либо именем переменной
    let right;
    if (
      typeof rightVar === "number" ||
      (!isNaN(parseFloat(rightVar)) && isFinite(rightVar))
    ) {
      // Если это число (или строка, которую можно преобразовать в число)
      right = typeof rightVar === "number" ? rightVar : parseFloat(rightVar);
    } else {
      // Если это имя переменной
      right = this.getValue(rightVar) || 0;
    }

    const result = left * right;

    this.setValue(resultVar, result);

    if (this.context.debug) {
      console.log(`${left} * ${right} = ${result} stored in ${resultVar}`);
    }
  }
}

export default MultiplyNode;
