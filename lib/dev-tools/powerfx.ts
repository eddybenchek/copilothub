export type PowerFxEvaluationResult =
  | { ok: true; value: unknown }
  | { ok: false; error: string };

type JsonParseResult =
  | { ok: true; data: unknown }
  | { ok: false; error: string };

type ProductsCollectionResult =
  | { ok: true; products: any[] }
  | { ok: false; error: string };

interface ParsedExpression {
  func: 'sum' | 'average' | 'countrows' | 'first' | 'last';
  collection: string;
  field?: string;
}

export function parseJsonInput(raw: string): JsonParseResult {
  const trimmed = raw.trim();
  if (!trimmed) {
    return {
      ok: false,
      error: 'Please provide JSON data before running a formula.',
    };
  }

  try {
    const data = JSON.parse(trimmed);
    return { ok: true, data };
  } catch (err) {
    const message =
      err instanceof Error ? err.message : 'Unknown JSON parse error';
    return {
      ok: false,
      error: `Invalid JSON: ${message}`,
    };
  }
}

export function getProductsCollection(data: unknown): ProductsCollectionResult {
  if (Array.isArray(data)) {
    return { ok: true, products: data };
  }

  if (
    data &&
    typeof data === 'object' &&
    'products' in data &&
    Array.isArray((data as any).products)
  ) {
    return { ok: true, products: (data as any).products };
  }

  return {
    ok: false,
    error:
      "Expected a top-level JSON array or an object with a 'products' array property.",
  };
}

export function parseExpression(expr: string): ParsedExpression | string {
  const trimmed = expr.trim();
  if (!trimmed) {
    return 'Please enter a Power Fx-style expression before running.';
  }

  const regex = /^(\w+)\s*\(\s*(\w+)\s*(?:,\s*(\w+)\s*)?\)$/i;
  const match = trimmed.match(regex);

  if (!match) {
    return 'Could not understand this expression. Try something like Sum(products, price) or CountRows(products).';
  }

  const [, funcRaw, collectionRaw, fieldRaw] = match;
  const func = funcRaw.toLowerCase();
  const collection = collectionRaw.toLowerCase();

  if (collection !== 'products') {
    return "This playground currently only supports a collection named 'products'.";
  }

  switch (func) {
    case 'sum':
    case 'average':
    case 'countrows':
    case 'first':
    case 'last':
      break;
    default:
      return `Unsupported function '${funcRaw}'. Supported functions are Sum, Average, CountRows, First, and Last.`;
  }

  if ((func === 'sum' || func === 'average') && !fieldRaw) {
    return `${funcRaw} requires a field name, e.g. ${funcRaw}(products, price).`;
  }

  return {
    func: func as ParsedExpression['func'],
    collection: collectionRaw,
    field: fieldRaw,
  };
}

export function evaluatePowerFx(
  expression: string,
  data: unknown,
): PowerFxEvaluationResult {
  const parsedExpr = parseExpression(expression);
  if (typeof parsedExpr === 'string') {
    return { ok: false, error: parsedExpr };
  }

  const productsResult = getProductsCollection(data);
  if (!productsResult.ok) {
    return { ok: false, error: productsResult.error };
  }

  const { products } = productsResult;
  const { func, field } = parsedExpr;

  if (func === 'countrows') {
    return { ok: true, value: products.length };
  }

  if (func === 'first') {
    return { ok: true, value: products[0] ?? null };
  }

  if (func === 'last') {
    return { ok: true, value: products[products.length - 1] ?? null };
  }

  if (!field) {
    return {
      ok: false,
      error: 'A field name is required for this function.',
    };
  }

  const numericValues: number[] = [];

  for (const item of products) {
    if (item && typeof item === 'object' && field in item) {
      const value = (item as any)[field];
      if (typeof value === 'number' && !Number.isNaN(value)) {
        numericValues.push(value);
      }
    }
  }

  if (numericValues.length === 0) {
    return {
      ok: false,
      error: `No numeric values found for field '${field}' in the products collection.`,
    };
  }

  const sum = numericValues.reduce((acc, n) => acc + n, 0);

  if (func === 'sum') {
    return { ok: true, value: sum };
  }

  if (func === 'average') {
    const avg = sum / numericValues.length;
    return { ok: true, value: avg };
  }

  return {
    ok: false,
    error: 'Unsupported expression.',
  };
}

export function runPowerFx(
  expression: string,
  rawJson: string,
): PowerFxEvaluationResult {
  const parsedJson = parseJsonInput(rawJson);
  if (!parsedJson.ok) {
    return parsedJson;
  }

  return evaluatePowerFx(expression, parsedJson.data);
}

