// Context.js - Контекст выполнения
import { MemoryAllocator } from "../memory/memory.js";
import BaseNode from "../vm/node.js";

class Context {
  constructor() {
    this.nodes = new Map(); // Хеш-таблица узлов (id -> узел)
    this.memoryAllocator = new MemoryAllocator(); // Фасад для работы с памятью
    this.stack = []; // Стек вызовов
    this.currentNodeId = null; // ID текущего исполняемого узла
    this.entryPoint = null; // ID точки входа (первого узла)
    this.exitNodeId = null; // ID узла выхода
    this.running = false; // Флаг выполнения
    this.debug = false; // Режим отладки
    this.jumpPerformed = false; // Флаг выполнения прыжка
  }

  // Добавление узла в контекст
  addNode(node) {
    if (!(node instanceof BaseNode)) {
      throw new Error("Only BaseNode instances can be added to context");
    }

    node.context = this;
    this.nodes.set(node.id, node);

    // Если это первый узел, делаем его точкой входа
    if (this.nodes.size === 1) {
      this.entryPoint = node.id;
    }

    // Если это узел выхода, запоминаем его
    if (node.type === "exit") {
      this.exitNodeId = node.id;
    }

    if (this.debug) {
      console.log(`Node ${node.id} (${node.type}) added to context`);
    }

    return node.id;
  }

  // Получение узла по ID
  getNode(id) {
    return this.nodes.get(id);
  }

  // Удаление узла
  removeNode(id) {
    const node = this.nodes.get(id);
    if (node) {
      // Проверяем, не ссылается ли кто-то на этот узел
      for (const [otherId, otherNode] of this.nodes) {
        if (otherNode.next === id) {
          otherNode.next = null;
          if (this.debug) {
            console.log(`Removed reference to ${id} from ${otherId}`);
          }
        }
      }

      this.nodes.delete(id);

      // Если удаляем точку входа, обновляем её
      if (this.entryPoint === id) {
        this.entryPoint =
          this.nodes.size > 0 ? this.nodes.keys().next().value : null;
      }

      // Если удаляем узел выхода
      if (this.exitNodeId === id) {
        this.exitNodeId = null;
      }

      if (this.debug) {
        console.log(`Node ${id} removed from context`);
      }
    }
  }

  // Запуск выполнения программы
  run(startNodeId = null) {
    const startId = startNodeId || this.entryPoint;

    if (!startId) {
      throw new Error("No entry point defined");
    }

    if (!this.nodes.has(startId)) {
      throw new Error(`Start node ${startId} not found`);
    }

    this.running = true;
    this.currentNodeId = startId;
    this.stack = [];
    this.jumpPerformed = false;

    if (this.debug) {
      console.log(`Program started at node ${startId}`);
      console.log("Memory statistics at start:", this.getMemoryStats());
    }

    // Основной цикл выполнения
    while (this.running && this.currentNodeId) {
      const currentNode = this.getNode(this.currentNodeId);

      if (!currentNode) {
        throw new Error(`Node ${this.currentNodeId} not found`);
      }

      if (this.debug) {
        console.log(`Executing node ${currentNode.id} (${currentNode.type})`);
      }

      try {
        // Выполняем текущий узел
        currentNode.execute();

        // Проверяем, не дошли ли до узла выхода
        if (this.currentNodeId === this.exitNodeId) {
          if (this.debug) {
            console.log("Reached exit node");
          }
          this.running = false;
          break;
        }

        // Получаем ID следующего узла (узлы могут изменить его через jump)
        const nextNodeId = currentNode.getNextNodeId();

        // Если был выполнен прыжок, currentNodeId уже мог измениться
        if (!this.jumpPerformed) {
          this.currentNodeId = nextNodeId;
        } else {
          this.jumpPerformed = false;
        }
      } catch (error) {
        console.error(`Error executing node ${currentNode.id}:`, error);
        this.running = false;
        throw error;
      }
    }

    if (this.debug) {
      console.log("Program finished");
      console.log("Memory statistics at end:", this.getMemoryStats());
    }
  }

  // Остановка выполнения
  stop() {
    this.running = false;
    if (this.debug) {
      console.log("Program stopped");
    }
  }

  // Получение списка всех узлов
  listNodes() {
    const result = [];
    for (const [id, node] of this.nodes) {
      result.push({
        id,
        type: node.type,
        next: node.next,
        args: node.args,
      });
    }
    return result;
  }

  // Получение статистики использования памяти
  getMemoryStats() {
    const stats = {};
    for (const [type, arenaStats] of this.memoryAllocator.getStatistics()) {
      stats[type] = {
        used: arenaStats.used,
        total: arenaStats.total,
        percentage: arenaStats.percentage,
      };
    }
    return stats;
  }

  // Получение списка переменных в памяти
  listVariables() {
    return this.memoryAllocator.listVariables();
  }

  // Построение графа связей узлов
  getGraph() {
    const graph = [];
    for (const [id, node] of this.nodes) {
      graph.push({
        id,
        type: node.type,
        next: node.next,
        args: node.args,
      });
    }
    return graph;
  }

  // Проверка наличия циклических ссылок
  hasCycles() {
    const visited = new Set();
    const recursionStack = new Set();

    const detectCycle = (nodeId) => {
      if (recursionStack.has(nodeId)) return true;
      if (visited.has(nodeId)) return false;

      visited.add(nodeId);
      recursionStack.add(nodeId);

      const node = this.getNode(nodeId);
      if (node && node.next) {
        if (detectCycle(node.next)) return true;
      }

      recursionStack.delete(nodeId);
      return false;
    };

    for (const [id] of this.nodes) {
      if (detectCycle(id)) return true;
    }

    return false;
  }

  // Очистка контекста
  clear() {
    this.nodes.clear();
    this.memoryAllocator.clearAll();
    this.stack = [];
    this.currentNodeId = null;
    this.entryPoint = null;
    this.exitNodeId = null;
    this.running = false;
    this.jumpPerformed = false;

    if (this.debug) {
      console.log("Context cleared");
    }
  }
}

export default Context;
