import {
  quicktype,
  InputData,
  jsonInputForTargetLanguage,
} from 'quicktype-core';

export type JsonToTsResult =
  | { ok: true; ts: string }
  | { ok: false; error: string };

export async function convertJsonToTypeScript(
  jsonString: string
): Promise<JsonToTsResult> {
  const trimmed = jsonString.trim();
  if (!trimmed) {
    return {
      ok: false,
      error: 'Please enter or paste JSON before generating.',
    };
  }

  try {
    JSON.parse(trimmed);
  } catch (err) {
    const message =
      err instanceof Error ? err.message : 'Unknown JSON parse error';
    return {
      ok: false,
      error: `Invalid JSON: ${message}`,
    };
  }

  try {
    const inputData = new InputData();
    const jsonInput = jsonInputForTargetLanguage('typescript');
    await jsonInput.addSource({
      name: 'Root',
      samples: [trimmed],
    });
    inputData.addInput(jsonInput);

    const result = await quicktype({
      lang: 'typescript',
      inputData,
      outputFilename: 'output.ts',
      rendererOptions: {
        'just-types': true,
      },
    });

    const ts = result.lines.join('\n');
    return { ok: true, ts };
  } catch (err) {
    const message =
      err instanceof Error ? err.message : 'Could not generate TypeScript. Check your JSON structure.';
    return {
      ok: false,
      error: message,
    };
  }
}
