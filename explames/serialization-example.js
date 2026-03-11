// explames/serialization-example.js
import {
  createContext,
  InputNode,
  MultiplyNode,
  AddNode,
  PrintNode,
  ExitNode,
  serializeGraph,
  deserializeGraph,
  saveGraphToFile,
  loadGraphFromFile,
  exportToDOT,
  cloneContext,
} from "../source/index.js";

// Создаем мок для браузерного окружения
global.window = {
  prompt: (message) => {
    console.log(message);
    return "42";
  },
};

// Создаем оригинальный контекст
console.log("=== Creating original program ===");
const originalContext = createContext({ debug: true });

const inputNode = new InputNode(
  null,
  ["userNumber", "Enter a number: "],
  originalContext,
);
const multiplyNode = new MultiplyNode(
  null,
  ["doubled", "userNumber", 2],
  originalContext,
);
const addNode = new AddNode(null, ["result", "doubled", 10], originalContext);
const printNode = new PrintNode(null, ["result"], originalContext);
const exitNode = new ExitNode(null, [], originalContext);

inputNode.setNextNodeId(multiplyNode.id);
multiplyNode.setNextNodeId(addNode.id);
addNode.setNextNodeId(printNode.id);
printNode.setNextNodeId(exitNode.id);

originalContext.addNode(inputNode);
originalContext.addNode(multiplyNode);
originalContext.addNode(addNode);
originalContext.addNode(printNode);
originalContext.addNode(exitNode);

// Сериализуем граф
console.log("\n=== Serializing graph ===");
const graph = serializeGraph(originalContext);
console.log("Serialized graph:", JSON.stringify(graph, null, 2));

// Сохраняем в файл (если в Node.js)
if (typeof window === "undefined") {
  await saveGraphToFile(originalContext, "program-graph.json");
  console.log("\nGraph saved to program-graph.json");
}

// Десериализуем в новый контекст
console.log("\n=== Deserializing graph ===");
const restoredContext = deserializeGraph(graph, { debug: true });

// Проверяем, что граф восстановлен правильно
console.log("Restored graph:", restoredContext.getGraph());

// Клонируем контекст
console.log("\n=== Cloning context ===");
const clonedContext = cloneContext(originalContext);
console.log("Cloned graph:", clonedContext.getGraph());

// Экспортируем в DOT для визуализации
console.log("\n=== DOT format ===");
const dot = exportToDOT(originalContext);
console.log(dot);

// Запускаем оригинальную программу
console.log("\n=== Running original program ===");
originalContext.run();

// Запускаем восстановленную программу
console.log("\n=== Running restored program ===");
restoredContext.run();

// Сравниваем результаты
console.log("\n=== Results comparison ===");
console.log(
  "Original - userNumber:",
  originalContext.memoryAllocator.get("userNumber"),
);
console.log(
  "Original - doubled:",
  originalContext.memoryAllocator.get("doubled"),
);
console.log(
  "Original - result:",
  originalContext.memoryAllocator.get("result"),
);
console.log(
  "Restored - userNumber:",
  restoredContext.memoryAllocator.get("userNumber"),
);
console.log(
  "Restored - doubled:",
  restoredContext.memoryAllocator.get("doubled"),
);
console.log(
  "Restored - result:",
  restoredContext.memoryAllocator.get("result"),
);
