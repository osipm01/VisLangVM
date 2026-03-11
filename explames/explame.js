// explames/test-browser-mock.js
// Тестовый скрипт с мок-объектом для браузерного окружения

// Создаем мок для браузерного окружения
global.window = {
  prompt: (message) => {
    console.log(message);
    // Для теста возвращаем фиксированное значение
    return "42";
  },
};

// Теперь импортируем и запускаем программу
import { createContext } from "../source/index.js";
import {
  InputNode,
  MultiplyNode,
  AddNode,
  PrintNode,
  ExitNode,
} from "../source/index.js";

// Создаем контекст
// Создаем мок для браузерного окружения
global.window = {
  prompt: (message) => {
    console.log(message);
    return "42";
  },
};

// Создаем контекст
const context = createContext({ debug: true });

// Создаем узлы - теперь передаем числа, а не строки
const inputNode = new InputNode(
  null,
  ["userNumber", "Enter a number: "],
  context,
);
const multiplyNode = new MultiplyNode(
  null,
  ["doubled", "userNumber", 2],
  context,
); // 2 как число
const addNode = new AddNode(null, ["result", "doubled", 10], context); // 10 как число
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

// Запускаем программу
console.log("\n=== Running fixed program ===\n");
context.run();

// Выводим результаты
console.log("\n=== Results ===");
console.log("userNumber =", context.memoryAllocator.get("userNumber")); // 42
console.log("doubled =", context.memoryAllocator.get("doubled")); // 84
console.log("result =", context.memoryAllocator.get("result")); // 94
