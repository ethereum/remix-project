import axios from 'axios';

// default Ollama ports to check (11434 is the legacy/standard port)
const OLLAMA_PORTS = [11434, 11435, 11436];
const OLLAMA_BASE_HOST = 'http://localhost';

let discoveredOllamaHost: string | null = null;

export async function discoverOllamaHost(): Promise<string | null> {
  if (discoveredOllamaHost) {
    return discoveredOllamaHost;
  }

  for (const port of OLLAMA_PORTS) {
    const host = `${OLLAMA_BASE_HOST}:${port}`;
    try {
      const res = await axios.get(`${host}/api/tags`, { timeout: 2000 });
      if (res.status === 200) {
        discoveredOllamaHost = host;
        console.log(`Ollama discovered on ${host}`);
        return host;
      }
    } catch (error) {
      continue; // next port
    }
  }
  return null;
}

export async function isOllamaAvailable(): Promise<boolean> {
  const host = await discoverOllamaHost();
  return host !== null;
}

export async function listModels(): Promise<string[]> {
  const host = await discoverOllamaHost();
  if (!host) {
    throw new Error('Ollama is not available');
  }

  try {
    const res = await axios.get(`${host}/api/tags`);
    return res.data.models.map((model: any) => model.name);
  } catch (error) {
    throw new Error('Failed to list Ollama models');
  }
}

export function getOllamaHost(): string | null {
  return discoveredOllamaHost;
}

export function resetOllamaHost(): void {
  discoveredOllamaHost = null;
}

export async function pullModel(modelName: string): Promise<void> {
  // in case the user wants to pull a model from registry
  const host = await discoverOllamaHost();
  if (!host) {
    throw new Error('Ollama is not available');
  }

  try {
    await axios.post(`${host}/api/pull`, { name: modelName });
    console.log(`Model ${modelName} pulled successfully`);
  } catch (error) {
    console.error('Error pulling model:', error);
    throw new Error(`Failed to pull model: ${modelName}`);
  }
}

export async function validateModel(modelName: string): Promise<boolean> {
  try {
    const models = await listModels();
    return models.includes(modelName);
  } catch (error) {
    return false;
  }
}

export async function getBestAvailableModel(): Promise<string | null> {
  try {
    const models = await listModels();
    if (models.length === 0) return null;

    // Prefer code-focused models for IDE
    const codeModels = models.filter(m =>
      m.includes('codellama') ||
      m.includes('code') ||
      m.includes('deepseek-coder') ||
      m.includes('starcoder')
    );

    if (codeModels.length > 0) {
      return codeModels[0];
    }
    // TODO get model stats and get best model
    return models[0];
  } catch (error) {
    console.error('Error getting best available model:', error);
    return null;
  }
}
