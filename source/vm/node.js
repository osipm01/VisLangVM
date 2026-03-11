import { MemoryAllocator } from "../memory/memory.js";

export default class BaseNode {
  constructor(next = null, args = [], context = null, type = "base") {
    this.next = next; // ID следующего узла
    this.args = args; // Аргументы узла (могут содержать имена переменных из памяти)
    this.context = context; // Контекст выполнения
    this.type = type; // Тип узла
    this.id = this.generateId(); // Уникальный идентификатор узла
  }

  // Генерация уникального ID для узла
  generateId() {
    return `${this.type}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // Получение значения из памяти по имени переменной
  getValue(varName) {
    if (!this.context || !this.context.memoryAllocator) {
      throw new Error("No memory allocator available");
    }
    return this.context.memoryAllocator.get(varName);
  }

  // Сохранение значения в память
  setValue(varName, value) {
    if (!this.context || !this.context.memoryAllocator) {
      throw new Error("No memory allocator available");
    }

    const allocator = this.context.memoryAllocator;

    // Проверяем, существует ли уже переменная
    const existing = allocator.get(varName);

    if (existing !== undefined) {
      // Переменная существует - обновляем
      return allocator.set(varName, value);
    } else {
      // Новая переменная - выделяем память
      return allocator.allocate(varName, value);
    }
  }

  // Освобождение переменной из памяти
  freeValue(varName) {
    if (!this.context || !this.context.memoryAllocator) {
      throw new Error("No memory allocator available");
    }

    return this.context.memoryAllocator.free(varName);
  }

  // Выполнение узла (должен быть переопределен в потомках)
  execute() {
    throw new Error("Execute method must be implemented by derived classes");
  }

  // Получение следующего узла для исполнения
  getNextNodeId() {
    return this.next;
  }

  // Установка следующего узла
  setNextNodeId(nodeId) {
    this.next = nodeId;
  }

  // Проверка типа узла
  is(type) {
    return this.type === type;
  }
}
