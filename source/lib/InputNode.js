// nodes/InputNode.js
import BaseNode from "../vm/node.js";

// Внимание: Этот узел использует prompt, который работает только в браузере
// Для Node.js нужно использовать readline
class InputNode extends BaseNode {
  constructor(next = null, args = [], context = null) {
    super(next, args, context, "input");
  }

  execute() {
    const [varName, promptText] = this.args;

    if (!varName) {
      throw new Error("InputNode requires variable name");
    }

    const prompt = promptText || "Enter value:";

    // Проверяем среду выполнения
    if (typeof window !== "undefined" && window.prompt) {
      // Браузерная среда
      const input = window.prompt(prompt);

      // Пытаемся преобразовать в число, если возможно
      let value = input;
      if (!isNaN(input) && input !== null && input.trim() !== "") {
        value = Number(input);
      }

      this.setValue(varName, value);
    } else {
      // Node.js среда - нужно использовать readline
      // Для простоты пока выбрасываем ошибку
      throw new Error(
        "InputNode requires browser environment with prompt or Node.js with readline implementation",
      );
    }

    if (this.context.debug) {
      console.log(`Input stored in ${varName}:`, this.getValue(varName));
    }
  }
}

export default InputNode;
