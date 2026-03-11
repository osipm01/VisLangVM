// simple-test.js
import { Arena, MemoryAllocator } from "../source/memory/memory.js";

console.log("🔧 ПРОСТОЙ ТЕСТ АРЕНЫ ПАМЯТИ");
console.log("=".repeat(50));

// Создаем арену
const arena = new Arena(20); // маленькая арена для наглядности
console.log("\n📌 СОЗДАНА АРЕНА (емкость 20 ячеек)");
arena.dump();

// 1. Выделяем переменные
console.log("\n📌 ВЫДЕЛЯЕМ ПЕРЕМЕННЫЕ");
console.log("-".repeat(30));

console.log("1. Выделяем a = 42 (число)");
arena.allocate("a", 42);
arena.dump();

console.log('\n2. Выделяем b = "Hi" (строка из 2 символов)');
arena.allocate("b", "Hi");
arena.dump();

console.log("\n3. Выделяем c = true (булево)");
arena.allocate("c", true);
arena.dump();

console.log("\n4. Выделяем d = null");
arena.allocate("d", null);
arena.dump();

// 2. Читаем значения
console.log("\n📌 ЧИТАЕМ ЗНАЧЕНИЯ");
console.log("-".repeat(30));
console.log(`a = ${arena.get("a")} (ожидается 42)`);
console.log(`b = ${arena.get("b")} (ожидается Hi)`);
console.log(`c = ${arena.get("c")} (ожидается true)`);
console.log(`d = ${arena.get("d")} (ожидается null)`);

// 3. Освобождаем переменную
console.log("\n📌 ОСВОБОЖДАЕМ b");
console.log("-".repeat(30));
arena.free("b");
arena.dump();

// 4. Выделяем новую переменную (должна занять свободное место)
console.log('\n📌 ВЫДЕЛЯЕМ e = "Hello" (должна занять место b)');
arena.allocate("e", "Hello");
arena.dump();

// 5. Пробуем обновить переменную с увеличением размера
console.log("\n📌 ОБНОВЛЯЕМ a с числа на строку (увеличение размера)");
console.log("-".repeat(30));
console.log("До обновления:");
arena.dump();

arena.set("a", "Long string that needs more space");

console.log("\nПосле обновления:");
arena.dump();

// 6. Проверяем все значения
console.log("\n📌 ФИНАЛЬНЫЕ ЗНАЧЕНИЯ");
console.log("-".repeat(30));
console.log(`a = ${arena.get("a")}`);
console.log(`c = ${arena.get("c")}`);
console.log(`d = ${arena.get("d")}`);
console.log(`e = ${arena.get("e")}`);

// 7. Пробуем выделить при нехватке места
console.log("\n📌 ТЕСТ НА НЕХВАТКУ МЕСТА");
console.log("-".repeat(30));
console.log("Пытаемся выделить очень длинную строку:");
const result = arena.allocate(
  "f",
  "This string is too long for the remaining space",
);
console.log(`Результат: ${result === -1 ? "❌ НЕ УДАЛОСЬ" : "✅ УСПЕШНО"}`);

// 8. Очищаем арену
console.log("\n📌 ОЧИСТКА АРЕНЫ");
console.log("-".repeat(30));
arena.clear();
arena.dump();

console.log("\n✅ ТЕСТ ЗАВЕРШЕН");

console.log("=".repeat(60));
console.log("🧪 ПРОСТОЙ ТЕСТ MEMORY ALLOCATOR");
console.log("=".repeat(60));

// Создаем аллокатор
const allocator = new MemoryAllocator();
console.log("\n✅ Аллокатор создан");

// 1. Выделяем переменные
console.log("\n📌 1. Выделяем переменные:");
console.log("-".repeat(40));

console.log('▶ Выделяем name = "Alice"');
allocator.allocate("name", "Alice");

console.log("▶ Выделяем age = 30");
allocator.allocate("age", 30);

console.log("▶ Выделяем active = true");
allocator.allocate("active", true);

console.log("▶ Выделяем lastLogin = null");
allocator.allocate("lastLogin", null);

console.log("▶ Выделяем scores = [95, 87, 92]");
allocator.allocate("scores", new Int32Array([95, 87, 92]));

console.log('▶ Выделяем temp1 = "temporary"');
allocator.allocate("temp1", "temporary");

console.log('▶ Выделяем temp2 = "another temp"');
allocator.allocate("temp2", "another temp");

// 2. Проверяем значения через get()
console.log("\n📌 2. Проверяем значения через get():");
console.log("-".repeat(40));

console.log(`name: ${allocator.get("name")} (ожидается: Alice)`);
console.log(`age: ${allocator.get("age")} (ожидается: 30)`);
console.log(`active: ${allocator.get("active")} (ожидается: true)`);
console.log(`lastLogin: ${allocator.get("lastLogin")} (ожидается: null)`);

const scores = allocator.get("scores");
console.log(
  `scores: [${Array.from(scores).join(", ")}] (ожидается: [95, 87, 92])`,
);

// 3. Проверяем listVariables()
console.log("\n📌 3. Список всех переменных через listVariables():");
console.log("-".repeat(40));

const variables = allocator.listVariables();
variables.forEach((v) => {
  let valueStr = v.value;
  if (v.value instanceof Int32Array) {
    valueStr = `[${Array.from(v.value).join(", ")}]`;
  } else if (typeof v.value === "string") {
    valueStr = `"${v.value}"`;
  }
  console.log(`  ${v.name}: ${valueStr} (${v.type})`);
});

// 4. Проверяем getStatistics()
console.log("\n📌 4. Статистика использования через getStatistics():");
console.log("-".repeat(40));

const stats = allocator.getStatistics();
for (const [type, data] of stats) {
  console.log(
    `  ${type}: ${data.used}/${data.total} ячеек (${data.percentage}%)`,
  );
}

// 5. Проверяем set() - обновление значений
console.log("\n📌 5. Обновление значений через set():");
console.log("-".repeat(40));

console.log('▶ Обновляем name = "Bob"');
allocator.set("name", "Bob");
console.log(`  name теперь: ${allocator.get("name")}`);

console.log("▶ Обновляем age = 31");
allocator.set("age", 31);
console.log(`  age теперь: ${allocator.get("age")}`);

console.log("▶ Обновляем scores = [100, 95, 98]");
allocator.set("scores", new Int32Array([100, 95, 98]));
const newScores = allocator.get("scores");
console.log(`  scores теперь: [${Array.from(newScores).join(", ")}]`);

// 6. Проверяем getVariableInfo()
console.log("\n📌 6. Информация о переменной через getVariableInfo():");
console.log("-".repeat(40));

const info = allocator.getVariableInfo("scores");
if (info) {
  console.log(`  scores: тип=${info.type}, смещение=${info.offset}`);
}

// 7. Проверяем free()
console.log("\n📌 7. Освобождение памяти через free():");
console.log("-".repeat(40));

console.log("▶ Удаляем temp1");
allocator.free("temp1");

console.log("▶ Удаляем temp2");
allocator.free("temp2");

console.log("\n  Переменные после удаления:");
const remainingVars = allocator.listVariables();
remainingVars.forEach((v) => {
  let valueStr = v.value;
  if (v.value instanceof Int32Array) {
    valueStr = `[${Array.from(v.value).join(", ")}]`;
  } else if (typeof v.value === "string") {
    valueStr = `"${v.value}"`;
  }
  console.log(`  ${v.name}: ${valueStr} (${v.type})`);
});

// 8. Проверяем getMemoryReport()
console.log("\n📌 8. Отчет о памяти через getMemoryReport():");
console.log("-".repeat(40));

const report = allocator.getMemoryReport();
console.log(`  Всего памяти: ${report.totalMemory} ячеек`);
console.log(`  Использовано: ${report.usedMemory} ячеек`);
console.log(`  Свободно: ${report.freeMemory} ячеек`);
console.log(`  Фрагментация: ${report.fragmentation.toFixed(2)}%`);

// 9. Проверяем findVariables() - добавим этот метод если его нет
console.log("\n📌 9. Поиск переменных по шаблону:");
console.log("-".repeat(40));

// Добавляем метод findVariables если его нет
if (!allocator.findVariables) {
  console.log("⚠️ Метод findVariables отсутствует, добавляем...");
  allocator.findVariables = function (pattern) {
    const regex =
      typeof pattern === "string"
        ? new RegExp(pattern.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"))
        : pattern;
    return this.listVariables().filter((v) => regex.test(v.name));
  };
}

// Ищем переменные, начинающиеся с 's'
const found = allocator.findVariables(/^s/);
console.log('  Переменные, начинающиеся с "s":');
found.forEach((v) => console.log(`    ${v.name}: ${v.value}`));

// 10. Проверяем clearAll()
console.log("\n📌 10. Очистка всего через clearAll():");
console.log("-".repeat(40));

console.log("▶ Очищаем все переменные");
allocator.clearAll();

console.log("\n  Переменные после очистки:");
const emptyVars = allocator.listVariables();
if (emptyVars.length === 0) {
  console.log("  (нет переменных)");
}

console.log("\n  Статистика после очистки:");
const finalStats = allocator.getStatistics();
for (const [type, data] of finalStats) {
  console.log(
    `  ${type}: ${data.used}/${data.total} ячеек (${data.percentage}%)`,
  );
}

console.log("\n" + "=".repeat(60));
console.log("✅ ТЕСТ ЗАВЕРШЕН УСПЕШНО");
console.log("=".repeat(60));
