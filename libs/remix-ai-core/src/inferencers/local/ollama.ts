import axios from 'axios';

const OLLAMA_HOST = 'http://localhost:11434';

export async function isOllamaAvailable(): Promise<boolean> {
  try {
    const res = await axios.get(`${OLLAMA_HOST}/api/tags`);
    return res.status === 200;
  } catch (error) {
    return false;
  }
}

export async function listModels(): Promise<string[]> {
  const res = await axios.get(`${OLLAMA_HOST}/api/tags`);
  return res.data.models.map((model: any) => model.name);
}

export async function setSystemPrompt(model: string, prompt: string): Promise<any> {
  const payload = {
    model,
    system: prompt,
    messages: [],
  };
  const res = await axios.post(`${OLLAMA_HOST}/api/chat`, payload);
  return res.data;
}

export async function chatWithModel(model: string, systemPrompt: string, userMessage: string): Promise<string> {
  const payload = {
    model,
    system: systemPrompt,
    messages: [
      { role: 'user', content: userMessage }
    ],
  };
  const res = await axios.post(`${OLLAMA_HOST}/api/chat`, payload);
  return res.data.message?.content || '[No response]';
}
