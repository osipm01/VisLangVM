// memory.js

class Arena {
  constructor(capacity = 1024) {
    this.capacity = capacity;
    this.memory = new Int32Array(capacity).fill(0);
    this.offsets = new Map(); // имя -> смещение
    this.freeBlocks = []; // список свободных блоков { start, size }
    this.lastIndex = 0;
  }

  encodeType(type) {
    const typeMap = {
      string: 1,
      number: 2,
      boolean: 3,
      null: 4,
      array: 5,
    };
    return typeMap[type] || 4;
  }

  decodeType(typeValue) {
    const typeMap = {
      1: "string",
      2: "number",
      3: "boolean",
      4: "null",
      5: "array",
    };
    return typeMap[typeValue] || "null";
  }

  calculateSize(value) {
    if (value === null) return 2;
    if (typeof value === "string") {
      return 2 + Math.ceil(value.length / 4);
    }
    if (typeof value === "number" || typeof value === "boolean") {
      return 2;
    }
    if (value instanceof Int32Array) {
      return 2 + value.length;
    }
    return 2;
  }

  calculateSizeByType(type, offset) {
    switch (type) {
      case "string":
        const strLength = this.memory[offset + 1];
        return 2 + Math.ceil(strLength / 4);
      case "number":
      case "boolean":
      case "null":
        return 2;
      case "array":
        const arrayLength = this.memory[offset + 1];
        return 2 + arrayLength;
      default:
        return 2;
    }
  }

  writeToMemory(offset, value) {
    if (value === null) {
      this.memory[offset] = this.encodeType("null");
      this.memory[offset + 1] = 0;
    } else if (typeof value === "string") {
      this.memory[offset] = this.encodeType("string");
      this.memory[offset + 1] = value.length;

      for (let i = 0; i < value.length; i += 4) {
        let chunk = 0;
        for (let j = 0; j < 4 && i + j < value.length; j++) {
          chunk |= (value.charCodeAt(i + j) & 0xff) << (j * 8);
        }
        this.memory[offset + 2 + Math.floor(i / 4)] = chunk;
      }
    } else if (typeof value === "number") {
      this.memory[offset] = this.encodeType("number");
      this.memory[offset + 1] = value;
    } else if (typeof value === "boolean") {
      this.memory[offset] = this.encodeType("boolean");
      this.memory[offset + 1] = value ? 1 : 0;
    } else if (value instanceof Int32Array) {
      this.memory[offset] = this.encodeType("array");
      this.memory[offset + 1] = value.length;
      for (let i = 0; i < value.length; i++) {
        this.memory[offset + 2 + i] = value[i];
      }
    }
  }

  readString(offset) {
    const length = this.memory[offset + 1];
    let result = "";

    const chunks = Math.ceil(length / 4);
    for (let i = 0; i < chunks; i++) {
      const chunk = this.memory[offset + 2 + i];
      for (let j = 0; j < 4 && i * 4 + j < length; j++) {
        const charCode = (chunk >> (j * 8)) & 0xff;
        result += String.fromCharCode(charCode);
      }
    }

    return result;
  }

  readArray(offset) {
    const length = this.memory[offset + 1];
    const array = new Int32Array(length);

    for (let i = 0; i < length; i++) {
      array[i] = this.memory[offset + 2 + i];
    }

    return array;
  }

  // Поиск свободного непрерывного блока нужного размера
  findFreeBlock(requiredSize) {
    // Сортируем свободные блоки по возрастанию начала
    this.freeBlocks.sort((a, b) => a.start - b.start);

    // Ищем первый подходящий блок
    for (let i = 0; i < this.freeBlocks.length; i++) {
      const block = this.freeBlocks[i];
      if (block.size >= requiredSize) {
        return block;
      }
    }

    return null;
  }

  // Удаляем блок из списка свободных
  removeFreeBlock(blockToRemove) {
    this.freeBlocks = this.freeBlocks.filter(
      (block) =>
        block.start !== blockToRemove.start ||
        block.size !== blockToRemove.size,
    );
  }

  // Добавляем свободный блок (и объединяем с соседними)
  addFreeBlock(start, size) {
    // Добавляем новый блок
    this.freeBlocks.push({ start, size });

    // Сортируем по началу
    this.freeBlocks.sort((a, b) => a.start - b.start);

    // Объединяем соседние блоки
    for (let i = 0; i < this.freeBlocks.length - 1; i++) {
      const current = this.freeBlocks[i];
      const next = this.freeBlocks[i + 1];

      if (current.start + current.size >= next.start) {
        // Блоки пересекаются или соприкасаются - объединяем
        current.size = Math.max(
          current.size,
          next.start - current.start + next.size,
        );
        this.freeBlocks.splice(i + 1, 1);
        i--; // проверяем снова этот же индекс
      }
    }
  }

  // Основной метод выделения памяти
  allocate(name, value) {
    if (this.offsets.has(name)) {
      console.error(`Variable "${name}" already exists`);
      return -1;
    }

    const requiredSize = this.calculateSize(value);

    // Сначала ищем свободный блок
    const freeBlock = this.findFreeBlock(requiredSize);

    let offset;
    if (freeBlock) {
      // Нашли свободный блок - используем его
      offset = freeBlock.start;

      // Если блок больше нужного, остаток оставляем как новый свободный блок
      if (freeBlock.size > requiredSize) {
        this.addFreeBlock(
          freeBlock.start + requiredSize,
          freeBlock.size - requiredSize,
        );
      }

      // Удаляем использованный блок
      this.removeFreeBlock(freeBlock);

      console.log(`Using free block at ${offset} for "${name}"`);
    } else {
      // Нет подходящего свободного блока - выделяем в конце
      if (this.lastIndex + requiredSize > this.capacity) {
        console.error(`Not enough space to allocate ${requiredSize} units`);
        return -1;
      }

      offset = this.lastIndex;
      this.lastIndex += requiredSize;
      console.log(`Allocating at end (${offset}) for "${name}"`);
    }

    this.offsets.set(name, offset);
    this.writeToMemory(offset, value);

    return offset;
  }

  // Освобождение памяти
  free(name) {
    const offset = this.offsets.get(name);
    if (offset === undefined) return false;

    const typeValue = this.memory[offset];
    const type = this.decodeType(typeValue);
    const size = this.calculateSizeByType(type, offset);

    // Очищаем память
    for (let i = 0; i < size; i++) {
      this.memory[offset + i] = 0;
    }

    // Удаляем из оффсетов
    this.offsets.delete(name);

    // Добавляем в список свободных блоков
    this.addFreeBlock(offset, size);

    // Если это был последний блок, обновляем lastIndex
    if (offset + size === this.lastIndex) {
      // Ищем новый lastIndex
      let newLastIndex = 0;
      for (const blockOffset of this.offsets.values()) {
        const blockType = this.decodeType(this.memory[blockOffset]);
        const blockSize = this.calculateSizeByType(blockType, blockOffset);
        newLastIndex = Math.max(newLastIndex, blockOffset + blockSize);
      }
      this.lastIndex = newLastIndex;

      // Удаляем свободные блоки, которые теперь за lastIndex
      this.freeBlocks = this.freeBlocks.filter(
        (block) => block.start < this.lastIndex,
      );
    }

    return true;
  }

  // Обновление переменной
  set(name, value) {
    const offset = this.offsets.get(name);
    if (offset === undefined) {
      console.error(`Variable "${name}" not found`);
      return false;
    }

    const oldType = this.decodeType(this.memory[offset]);
    const oldSize = this.calculateSizeByType(oldType, offset);
    const newSize = this.calculateSize(value);

    // Если новый размер меньше или равен старому
    if (newSize <= oldSize) {
      this.writeToMemory(offset, value);

      // Если осталось свободное место в конце блока
      if (newSize < oldSize) {
        this.addFreeBlock(offset + newSize, oldSize - newSize);
      }

      return true;
    }

    // Новый размер больше - нужно искать новое место
    console.log(
      `"${name}" needs more space (${oldSize} -> ${newSize}), relocating...`,
    );

    // Сохраняем старое значение на случай неудачи
    const oldValue = this.get(name);

    // Освобождаем старое место
    this.free(name);

    // Пробуем выделить новое
    const newOffset = this.allocate(name, value);

    if (newOffset === -1) {
      // Не удалось выделить - восстанавливаем старое
      console.error(`Failed to relocate "${name}", restoring old value`);
      this.allocate(name, oldValue);
      return false;
    }

    return true;
  }

  getOffset(name) {
    return this.offsets.get(name);
  }

  get(name) {
    const offset = this.offsets.get(name);
    if (offset === undefined) return undefined;

    const typeValue = this.memory[offset];
    const type = this.decodeType(typeValue);

    switch (type) {
      case "string":
        return this.readString(offset);
      case "number":
        return this.memory[offset + 1];
      case "boolean":
        return this.memory[offset + 1] === 1;
      case "null":
        return null;
      case "array":
        return this.readArray(offset);
      default:
        return undefined;
    }
  }

  hasSpace(requiredSize) {
    // Проверяем свободные блоки
    if (this.findFreeBlock(requiredSize)) {
      return true;
    }
    // Или место в конце
    return this.lastIndex + requiredSize <= this.capacity;
  }

  clear() {
    this.memory.fill(0);
    this.offsets.clear();
    this.freeBlocks = [];
    this.lastIndex = 0;
  }

  getUsage() {
    return this.lastIndex;
  }

  // Для отладки
  dump() {
    console.log("=== Arena Dump ===");
    console.log(`Capacity: ${this.capacity}`);
    console.log(`LastIndex: ${this.lastIndex}`);
    console.log("Variables:");
    for (const [name, offset] of this.offsets) {
      const type = this.decodeType(this.memory[offset]);
      const size = this.calculateSizeByType(type, offset);
      console.log(`  ${name}: offset=${offset}, size=${size}, type=${type}`);
    }
    console.log("Free blocks:");
    for (const block of this.freeBlocks) {
      console.log(`  start=${block.start}, size=${block.size}`);
    }
  }
}

// MemoryAllocator (можно оставить как есть или тоже упростить)
class MemoryAllocator {
  constructor() {
    this.arenas = new Map();
    this.globalRegistry = new Map();
    this.arenaConfig = new Map();

    this.arenaConfig.set("string", 2048);
    this.arenaConfig.set("number", 1024);
    this.arenaConfig.set("boolean", 512);
    this.arenaConfig.set("null", 128);
    this.arenaConfig.set("array", 4096);

    this.initializeArenas();
  }

  initializeArenas() {
    for (const [type, size] of this.arenaConfig) {
      this.arenas.set(type, new Arena(size));
    }
  }

  detectType(value) {
    if (value === null) return "null";
    if (typeof value === "string") return "string";
    if (typeof value === "number") return "number";
    if (typeof value === "boolean") return "boolean";
    if (value instanceof Int32Array) return "array";
    return "null";
  }

  allocate(name, value) {
    if (this.globalRegistry.has(name)) {
      console.error(`Variable "${name}" already exists`);
      return false;
    }

    const type = this.detectType(value);
    const arena = this.arenas.get(type);
    if (!arena) {
      console.error(`No arena configured for type: ${type}`);
      return false;
    }

    const offset = arena.allocate(name, value);
    if (offset === -1) {
      console.error(`Failed to allocate memory for "${name}" in ${type} arena`);
      return false;
    }

    this.globalRegistry.set(name, { type, arena });
    return true;
  }

  get(name) {
    const info = this.globalRegistry.get(name);
    if (!info) return undefined;
    return info.arena.get(name);
  }

  set(name, value) {
    const info = this.globalRegistry.get(name);
    if (!info) {
      console.error(`Variable "${name}" not found`);
      return false;
    }

    const newType = this.detectType(value);

    if (newType !== info.type) {
      console.log(`Type changed for "${name}": ${info.type} -> ${newType}`);
      info.arena.free(name);
      this.globalRegistry.delete(name);
      return this.allocate(name, value);
    } else {
      return info.arena.set(name, value);
    }
  }

  free(name) {
    const info = this.globalRegistry.get(name);
    if (!info) return false;

    const success = info.arena.free(name);
    if (success) {
      this.globalRegistry.delete(name);
    }
    return success;
  }

  listVariables() {
    const result = [];
    for (const [name, info] of this.globalRegistry) {
      const value = info.arena.get(name);
      if (value !== undefined) {
        result.push({ name, type: info.type, value });
      }
    }
    return result;
  }

  getStatistics() {
    const stats = new Map();
    for (const [type, arena] of this.arenas) {
      const used = arena.getUsage();
      const total = arena.capacity;
      const percentage = total > 0 ? Math.round((used / total) * 100) : 0;
      stats.set(type, { used, total, percentage });
    }
    return stats;
  }

  clearAll() {
    for (const arena of this.arenas.values()) {
      arena.clear();
    }
    this.globalRegistry.clear();
  }
}

export { Arena, MemoryAllocator };
