// serializer.js - Функции для сериализации графа узлов
import Context from "../context/context.js";
import {
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
} from "../lib/index.js";

// Маппинг типов узлов к классам
const nodeClassMap = {
  print: PrintNode,
  add: AddNode,
  subtract: SubtractNode,
  multiply: MultiplyNode,
  divide: DivideNode,
  input: InputNode,
  exit: ExitNode,
  assign: AssignNode,
  compare: CompareNode,
  jump: JumpNode,
};

/**
 * Сериализация графа узлов в JSON
 * @param {Context} context - Контекст выполнения с узлами
 * @returns {Object} - Сериализованный граф
 */
export function serializeGraph(context) {
  if (!(context instanceof Context)) {
    throw new Error("Expected Context instance");
  }

  const nodes = context.listNodes();
  const variables = context.listVariables();

  // Получаем связи между узлами
  const edges = [];
  for (const node of nodes) {
    if (node.next) {
      edges.push({
        from: node.id,
        to: node.next,
      });
    }
  }

  // Сериализуем граф
  const graph = {
    metadata: {
      version: "1.0.0",
      nodeCount: nodes.length,
      variableCount: variables.length,
      timestamp: new Date().toISOString(),
      entryPoint: context.entryPoint,
      exitNodeId: context.exitNodeId,
    },
    nodes: nodes.map((node) => ({
      id: node.id,
      type: node.type,
      args: node.args.map((arg) => {
        // Если аргумент является переменной, сохраняем только имя
        if (
          typeof arg === "string" &&
          context.memoryAllocator.get(arg) !== undefined
        ) {
          return { type: "variable", name: arg };
        }
        // Если аргумент - литерал, сохраняем значение
        return { type: "literal", value: arg };
      }),
      next: node.next,
    })),
    edges: edges,
    variables: variables.map((v) => ({
      name: v.name,
      type: v.type,
      value: v.value,
    })),
    memoryStats: context.getMemoryStats(),
  };

  return graph;
}

/**
 * Сохранение графа в файл (для Node.js)
 * @param {Context} context - Контекст выполнения
 * @param {string} filename - Имя файла
 */
export async function saveGraphToFile(context, filename) {
  if (typeof window !== "undefined") {
    throw new Error("saveGraphToFile is only available in Node.js environment");
  }

  const fs = await import("fs/promises");
  const graph = serializeGraph(context);
  await fs.writeFile(filename, JSON.stringify(graph, null, 2));
  console.log(`Graph saved to ${filename}`);
}

/**
 * Загрузка графа из файла (для Node.js)
 * @param {string} filename - Имя файла
 * @returns {Promise<Object>} - Загруженный граф
 */
export async function loadGraphFromFile(filename) {
  if (typeof window !== "undefined") {
    throw new Error(
      "loadGraphFromFile is only available in Node.js environment",
    );
  }

  const fs = await import("fs/promises");
  const data = await fs.readFile(filename, "utf-8");
  return JSON.parse(data);
}

/**
 * Десериализация графа в контекст
 * @param {Object} graph - Сериализованный граф
 * @param {Object} options - Опции (debug, etc.)
 * @returns {Context} - Восстановленный контекст
 */
export function deserializeGraph(graph, options = {}) {
  // Создаем новый контекст
  const context = new Context();

  if (options.debug) {
    context.debug = true;
  }

  // Восстанавливаем переменные в памяти
  if (graph.variables) {
    for (const variable of graph.variables) {
      // Восстанавливаем значение в зависимости от типа
      let value = variable.value;
      if (variable.type === "array" && Array.isArray(variable.value)) {
        value = new Int32Array(variable.value);
      }
      context.memoryAllocator.allocate(variable.name, value);
    }
  }

  // Восстанавливаем узлы
  const nodeMap = new Map(); // id -> узел

  for (const nodeData of graph.nodes) {
    // Получаем класс узла по типу
    const NodeClass = nodeClassMap[nodeData.type];
    if (!NodeClass) {
      throw new Error(`Unknown node type: ${nodeData.type}`);
    }

    // Восстанавливаем аргументы
    const args = nodeData.args.map((arg) => {
      if (arg.type === "variable") {
        return arg.name;
      }
      return arg.value;
    });

    // Создаем узел (без next, потом свяжем)
    const node = new NodeClass(null, args, context);

    // Сохраняем оригинальный ID
    node.id = nodeData.id;
    nodeMap.set(nodeData.id, node);
  }

  // Восстанавливаем связи между узлами
  for (const nodeData of graph.nodes) {
    if (nodeData.next) {
      const node = nodeMap.get(nodeData.id);
      node.setNextNodeId(nodeData.next);
    }
  }

  // Добавляем узлы в контекст
  for (const node of nodeMap.values()) {
    context.addNode(node);
  }

  // Восстанавливаем точку входа и выход
  if (graph.metadata.entryPoint) {
    context.entryPoint = graph.metadata.entryPoint;
  }

  if (graph.metadata.exitNodeId) {
    context.exitNodeId = graph.metadata.exitNodeId;
  }

  return context;
}

/**
 * Экспорт графа в формат для визуализации (DOT)
 * @param {Context} context - Контекст выполнения
 * @returns {string} - DOT граф
 */
export function exportToDOT(context) {
  const graph = serializeGraph(context);

  let dot = "digraph ProgramGraph {\n";
  dot += "  rankdir=LR;\n";
  dot += "  node [shape=box, style=rounded];\n\n";

  // Добавляем узлы
  for (const node of graph.nodes) {
    const label = `${node.type}\\n${node.args.map((a) => (a.type === "variable" ? `$${a.name}` : a.value)).join(" ")}`;
    dot += `  "${node.id}" [label="${label}"];\n`;
  }

  // Добавляем ребра
  dot += "\n";
  for (const edge of graph.edges) {
    dot += `  "${edge.from}" -> "${edge.to}";\n`;
  }

  // Отмечаем точку входа
  if (graph.metadata.entryPoint) {
    dot += `\n  start [shape=circle, label="Start"];\n`;
    dot += `  start -> "${graph.metadata.entryPoint}";\n`;
  }

  // Отмечаем точку выхода
  if (graph.metadata.exitNodeId) {
    dot += `  "${graph.metadata.exitNodeId}" [shape=doublecircle];\n`;
  }

  dot += "}\n";

  return dot;
}

/**
 * Создание глубокой копии контекста через сериализацию
 * @param {Context} context - Исходный контекст
 * @returns {Context} - Копия контекста
 */
export function cloneContext(context) {
  const graph = serializeGraph(context);
  return deserializeGraph(graph, { debug: context.debug });
}

// Экспортируем также для использования в index.js
export default {
  serializeGraph,
  deserializeGraph,
  saveGraphToFile,
  loadGraphFromFile,
  exportToDOT,
  cloneContext,
};
