// index.js - Главная точка входа для всей VM системы

// Экспорты из memory
export { Arena, MemoryAllocator } from "./memory/memory.js";

// Импортируем Context для использования внутри файла
import Context from "./context/context.js";
// Экспортируем Context
export { Context };

// Экспорты из node
export { default as BaseNode } from "./vm/node.js";

// Экспорты всех стандартных узлов из lib
export {
  PrintNode,
  AddNode,
  SubtractNode,
  MultiplyNode,
  DivideNode,
  InputNode,
  ExitNode,
  AssignNode,
  CompareNode,
  JumpNode,
} from "./lib/index.js";

// Для удобства можно также экспортировать все узлы под одним объектом
import * as StdNodes from "./lib/index.js";
export { StdNodes };

// Импортируем функции сериализации
import {
  serializeGraph,
  deserializeGraph,
  saveGraphToFile,
  loadGraphFromFile,
  exportToDOT,
  cloneContext,
} from "./utils/serializer.js";

// Экспортируем функции сериализации
export {
  serializeGraph,
  deserializeGraph,
  saveGraphToFile,
  loadGraphFromFile,
  exportToDOT,
  cloneContext,
};

// Вспомогательная функция для создания контекста с предустановленными настройками
export function createContext(options = {}) {
  const context = new Context();

  if (options.debug) {
    context.debug = true;
  }

  if (options.memoryConfig) {
    // Можно добавить кастомную конфигурацию памяти
  }

  return context;
}

// Вспомогательная функция для создания простой программы из массива узлов
export function createProgram(context, nodes) {
  const nodeMap = new Map();

  // Создаем все узлы
  for (const [type, args, next] of nodes) {
    let NodeClass;

    // Определяем класс узла по типу
    switch (type) {
      case "print":
        NodeClass = PrintNode;
        break;
      case "add":
        NodeClass = AddNode;
        break;
      case "subtract":
        NodeClass = SubtractNode;
        break;
      case "multiply":
        NodeClass = MultiplyNode;
        break;
      case "divide":
        NodeClass = DivideNode;
        break;
      case "input":
        NodeClass = InputNode;
        break;
      case "exit":
        NodeClass = ExitNode;
        break;
      case "assign":
        NodeClass = AssignNode;
        break;
      case "compare":
        NodeClass = CompareNode;
        break;
      case "jump":
        NodeClass = JumpNode;
        break;
      default:
        throw new Error(`Unknown node type: ${type}`);
    }

    const node = new NodeClass(next, args, context);
    nodeMap.set(node.id, node);
  }

  // Добавляем узлы в контекст
  for (const node of nodeMap.values()) {
    context.addNode(node);
  }

  return context;
}

// Версия и метаданные
export const VERSION = "1.0.0";
export const METADATA = {
  name: "JavaScript VM with Arena Memory Allocator",
  version: VERSION,
  description:
    "A virtual machine with arena-based memory allocation and node-based program execution",
  nodeTypes: [
    "print",
    "add",
    "subtract",
    "multiply",
    "divide",
    "input",
    "exit",
    "assign",
    "compare",
    "jump",
  ],
  memoryTypes: ["string", "number", "boolean", "null", "array"],
};

// Пример использования (экспортируем как функцию для демо)
export function example() {
  console.log("=== VM System Example ===");
  console.log("Version:", VERSION);
  console.log("Available node types:", METADATA.nodeTypes);
  console.log("Available memory types:", METADATA.memoryTypes);

  // Создаем контекст
  const context = createContext({ debug: true });

  // Создаем простую программу: input -> multiply by 2 -> add 10 -> print -> exit
  const inputNode = new InputNode(
    null,
    ["userNumber", "Enter a number: "],
    context,
  );
  const multiplyNode = new MultiplyNode(
    null,
    ["doubled", "userNumber", 2], // Исправлено: 2 как число, а не строка
    context,
  );
  const addNode = new AddNode(
    null,
    ["result", "doubled", 10], // Исправлено: 10 как число, а не строка
    context,
  );
  const printNode = new PrintNode(null, ["result"], context);
  const exitNode = new ExitNode(null, [], context);

  // Связываем узлы
  inputNode.setNextNodeId(multiplyNode.id);
  multiplyNode.setNextNodeId(addNode.id);
  addNode.setNextNodeId(printNode.id);
  printNode.setNextNodeId(exitNode.id);

  // Добавляем в контекст
  context.addNode(inputNode);
  context.addNode(multiplyNode);
  context.addNode(addNode);
  context.addNode(printNode);
  context.addNode(exitNode);

  console.log("\nProgram graph:", context.getGraph());

  return context;
}

// Если файл запущен напрямую, показываем пример
// Проверяем, запущен ли файл напрямую (для ES модулей)
const isMainModule = import.meta.url === `file://${process.argv[1]}`;
if (isMainModule) {
  console.log("Running example...");
  const context = example();
}
