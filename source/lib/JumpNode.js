// nodes/JumpNode.js
import BaseNode from "../vm/node.js";

class JumpNode extends BaseNode {
  constructor(next = null, args = [], context = null) {
    super(next, args, context, "jump");
  }

  execute() {
    const [targetNodeId, conditionVar] = this.args;

    if (!targetNodeId) {
      throw new Error("JumpNode requires target node ID");
    }

    // Проверяем условие, если оно задано
    if (conditionVar !== undefined) {
      const condition = this.getValue(conditionVar);

      // Если условие ложно, не прыгаем
      if (!condition) {
        if (this.context.debug) {
          console.log(`Jump condition false, continuing to next node`);
        }
        return;
      }
    }

    // Выполняем прыжок
    if (this.context.debug) {
      console.log(`Jumping to node ${targetNodeId}`);
    }

    // Устанавливаем следующий узел для исполнения
    this.context.currentNodeId = targetNodeId;

    // Важно: предотвращаем автоматический переход к следующему узлу
    // после выполнения этого узла
    this.context.jumpPerformed = true;
  }

  // Переопределяем метод получения следующего узла
  getNextNodeId() {
    // Если был выполнен прыжок, возвращаем null, чтобы основной цикл
    // не пытался перейти к следующему узлу
    if (this.context && this.context.jumpPerformed) {
      this.context.jumpPerformed = false;
      return null;
    }
    return this.next;
  }
}

export default JumpNode;
