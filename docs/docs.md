```markdown
# Arena VM - Документация

Виртуальная машина с аренной системой выделения памяти и узловой архитектурой выполнения программ.

## 📦 Установка

```bash
npm install arena-vm
```

## 🏗 Архитектура

### Компоненты системы

1. **Memory Allocator** - аренная система памяти с разделением по типам данных
2. **Context** - контекст выполнения, содержащий узлы и аллокатор памяти
3. **BaseNode** - базовый класс для всех узлов
4. **StdNodes** - стандартная библиотека узлов

### Структура проекта

```
source/
├── index.js                 # Главная точка входа
├── memory/
│   └── memory.js            # Arena и MemoryAllocator
├── context/
│   └── context.js           # Контекст выполнения
├── vm/
│   └── node.js              # Базовый класс узла
├── lib/                      # Стандартные узлы
│   ├── index.js
│   ├── PrintNode.js
│   ├── AddNode.js
│   ├── SubtractNode.js
│   ├── MultiplyNode.js
│   ├── DivideNode.js
│   ├── InputNode.js
│   ├── ExitNode.js
│   ├── AssignNode.js
│   ├── CompareNode.js
│   └── JumpNode.js
└── serializer.js            # Сериализация графа
```

## 🚀 Быстрый старт

```javascript
import { 
  createContext, 
  InputNode, 
  MultiplyNode, 
  AddNode, 
  PrintNode, 
  ExitNode 
} from 'arena-vm';

// Создаем контекст
const context = createContext({ debug: true });

// Создаем узлы
const inputNode = new InputNode(null, ['userNumber', 'Enter a number: '], context);
const multiplyNode = new MultiplyNode(null, ['doubled', 'userNumber', 2], context);
const addNode = new AddNode(null, ['result', 'doubled', 10], context);
const printNode = new PrintNode(null, ['result'], context);
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
context.run();
```

## 📚 API Reference

### Context

Контекст выполнения программы.

```javascript
import { Context } from 'arena-vm';

const context = new Context();
context.debug = true; // Включить отладку
```

#### Методы

| Метод | Описание |
|-------|----------|
| `addNode(node)` | Добавляет узел в контекст |
| `getNode(id)` | Получает узел по ID |
| `removeNode(id)` | Удаляет узел |
| `run(startNodeId)` | Запускает выполнение программы |
| `stop()` | Останавливает выполнение |
| `listNodes()` | Возвращает список всех узлов |
| `getMemoryStats()` | Возвращает статистику использования памяти |
| `listVariables()` | Возвращает список переменных |
| `getGraph()` | Возвращает граф связей узлов |
| `hasCycles()` | Проверяет наличие циклических ссылок |
| `clear()` | Очищает контекст |

### BaseNode

Базовый класс для всех узлов.

```javascript
import { BaseNode } from 'arena-vm';

class CustomNode extends BaseNode {
  constructor(next = null, args = [], context = null) {
    super(next, args, context, 'custom');
  }

  execute() {
    // Реализация логики узла
    const value = this.getValue('variableName');
    this.setValue('result', value * 2);
  }
}
```

#### Методы BaseNode

| Метод | Описание |
|-------|----------|
| `getValue(varName)` | Получает значение переменной из памяти |
| `setValue(varName, value)` | Сохраняет значение в память |
| `freeValue(varName)` | Освобождает переменную из памяти |
| `execute()` | Абстрактный метод для реализации логики узла |
| `getNextNodeId()` | Возвращает ID следующего узла |
| `setNextNodeId(nodeId)` | Устанавливает ID следующего узла |
| `is(type)` | Проверяет тип узла |

### MemoryAllocator

Фасад для работы с аренной памятью.

```javascript
import { MemoryAllocator } from 'arena-vm';

const allocator = new MemoryAllocator();
allocator.allocate('x', 42);
const value = allocator.get('x'); // 42
```

#### Методы MemoryAllocator

| Метод | Описание |
|-------|----------|
| `allocate(name, value)` | Выделяет память под переменную |
| `get(name)` | Получает значение переменной |
| `set(name, value)` | Обновляет значение переменной |
| `free(name)` | Освобождает память |
| `listVariables()` | Возвращает список всех переменных |
| `getStatistics()` | Возвращает статистику по аренам |
| `clearAll()` | Очищает всю память |

### Arena

Отдельная арена для конкретного типа данных.

```javascript
import { Arena } from 'arena-vm';

const arena = new Arena(1024); // арена на 1024 юнита
arena.allocate('name', 'John');
```

### Стандартные узлы

#### PrintNode
Выводит значение переменной в консоль.
```javascript
new PrintNode(next, ['variableName'], context);
```

#### AddNode
Складывает два числа.
```javascript
new AddNode(next, ['result', 'leftVar', 5], context);
// leftVar + 5 -> result
```

#### SubtractNode
Вычитает два числа.
```javascript
new SubtractNode(next, ['result', 'leftVar', 3], context);
// leftVar - 3 -> result
```

#### MultiplyNode
Умножает два числа.
```javascript
new MultiplyNode(next, ['result', 'leftVar', 2], context);
// leftVar * 2 -> result
```

#### DivideNode
Делит два числа.
```javascript
new DivideNode(next, ['result', 'leftVar', 2], context);
// leftVar / 2 -> result
```

#### InputNode
Получает ввод от пользователя.
```javascript
new InputNode(next, ['variableName', 'Prompt text: '], context);
```

#### ExitNode
Точка выхода из программы.
```javascript
new ExitNode(next, [], context);
```

#### AssignNode
Присваивает значение переменной.
```javascript
// Прямое присваивание
new AssignNode(next, ['x', 42], context);
// Копирование из другой переменной
new AssignNode(next, ['y', 'x'], context);
```

#### CompareNode
Сравнивает два значения.
```javascript
new CompareNode(next, ['result', 'a', 'b', '>='], context);
// Поддерживаемые операторы: ==, ===, !=, !==, <, <=, >, >=
```

#### JumpNode
Условный или безусловный переход.
```javascript
// Безусловный переход
new JumpNode(next, ['targetNodeId'], context);
// Условный переход
new JumpNode(next, ['targetNodeId', 'conditionVar'], context);
```

## 💾 Сериализация

Функции для сохранения и загрузки графа узлов.

```javascript
import { 
  serializeGraph,
  deserializeGraph,
  saveGraphToFile,
  loadGraphFromFile,
  exportToDOT,
  cloneContext
} from 'arena-vm';

// Сериализация в JSON
const graph = serializeGraph(context);

// Сохранение в файл (Node.js)
await saveGraphToFile(context, 'program.json');

// Загрузка из файла (Node.js)
const loadedGraph = await loadGraphFromFile('program.json');
const newContext = deserializeGraph(loadedGraph);

// Клонирование контекста
const clone = cloneContext(context);

// Экспорт в DOT для визуализации
const dot = exportToDOT(context);
```

## 🎯 Примеры

### Простая программа

```javascript
import { createContext, InputNode, MultiplyNode, PrintNode, ExitNode } from 'arena-vm';

const context = createContext({ debug: true });

const input = new InputNode(null, ['age', 'How old are you? '], context);
const multiply = new MultiplyNode(null, ['ageInMonths', 'age', 12], context);
const print = new PrintNode(null, ['ageInMonths'], context);
const exit = new ExitNode(null, [], context);

input.setNextNodeId(multiply.id);
multiply.setNextNodeId(print.id);
print.setNextNodeId(exit.id);

[input, multiply, print, exit].forEach(node => context.addNode(node));

context.run();
```

### Условное выполнение

```javascript
import { Context, InputNode, CompareNode, JumpNode, PrintNode, ExitNode } from 'arena-vm';

const context = new Context();
context.debug = true;

// Создаем узлы
const input = new InputNode(null, ['age', 'Enter your age: '], context);
const compare = new CompareNode(null, ['isAdult', 'age', 18, '>='], context);
const jumpAdult = new JumpNode(null, ['printAdult', 'isAdult'], context);
const jumpChild = new JumpNode(null, ['printChild'], context);
const printAdult = new PrintNode(null, ['message1'], context);
const printChild = new PrintNode(null, ['message2'], context);
const exit = new ExitNode(null, [], context);

// Настраиваем сообщения (константы)
context.memoryAllocator.allocate('message1', 'You are an adult');
context.memoryAllocator.allocate('message2', 'You are a child');

// Связываем узлы
input.setNextNodeId(compare.id);
compare.setNextNodeId(jumpAdult.id);
jumpAdult.setNextNodeId(jumpChild.id);
jumpAdult.setNextNodeId(printAdult.id); // если isAdult true
jumpChild.setNextNodeId(printChild.id);
printAdult.setNextNodeId(exit.id);
printChild.setNextNodeId(exit.id);

// Добавляем в контекст
const nodes = [input, compare, jumpAdult, jumpChild, printAdult, printChild, exit];
nodes.forEach(node => context.addNode(node));

context.run();
```

## 📊 Статистика памяти

```javascript
const stats = context.getMemoryStats();
console.log(stats);
// {
//   string: { used: 0, total: 2048, percentage: 0 },
//   number: { used: 6, total: 1024, percentage: 1 },
//   boolean: { used: 0, total: 512, percentage: 0 },
//   null: { used: 0, total: 128, percentage: 0 },
//   array: { used: 0, total: 4096, percentage: 0 }
// }

const variables = context.listVariables();
console.log(variables);
// [
//   { name: 'userNumber', type: 'number', value: 42 },
//   { name: 'doubled', type: 'number', value: 84 },
//   { name: 'result', type: 'number', value: 94 }
// ]
```

## 🔧 Создание собственных узлов

```javascript
import { BaseNode } from 'arena-vm';

class PowerNode extends BaseNode {
  constructor(next = null, args = [], context = null) {
    super(next, args, context, 'power');
  }

  execute() {
    const [resultVar, baseVar, exponent] = this.args;
    
    const base = this.getValue(baseVar) || 0;
    const exp = typeof exponent === 'number' ? exponent : this.getValue(exponent) || 0;
    
    const result = Math.pow(base, exp);
    this.setValue(resultVar, result);
    
    if (this.context.debug) {
      console.log(`${base}^${exp} = ${result} stored in ${resultVar}`);
    }
  }
}

export default PowerNode;
```

## 📝 Лицензия

MIT
```

Эта документация включает:
- ✅ Полное описание архитектуры
- ✅ API Reference для всех компонентов
- ✅ Примеры использования каждого узла
- ✅ Примеры сериализации
- ✅ Инструкции по созданию собственных узлов
- ✅ Демонстрацию работы со статистикой памяти
