import { ChatHistory } from '../prompts/chat';
import { JsonStreamParser } from '../types/types';

export const HandleSimpleResponse = async (response, cb?: (streamText: string) => void) => {
  let resultText = '';
  const parser = new JsonStreamParser();

  const chunk = parser.safeJsonParse<{ generatedText: string; isGenerating: boolean }>(response);
  for (const parsedData of chunk) {
    resultText += parsedData.generatedText;
    if (cb) {
      cb(parsedData.generatedText);
    }
  }
};

export const HandleStreamResponse = async (streamResponse, cb: (streamText: string) => void, done_cb?: (result: string) => void) => {
  try {
    let resultText = '';
    const parser = new JsonStreamParser();
    const reader = streamResponse.body?.getReader();
    const decoder = new TextDecoder();

    // Check for missing body in the streamResponse
    if (!reader) {
      // most likely no stream response, so we can just return the result
      cb(streamResponse.result)
      done_cb?.("");
      return;
    }

    // eslint-disable-next-line no-constant-condition
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      try {
        const chunk = parser.safeJsonParse<{ generatedText: string; isGenerating: boolean }>(decoder.decode(value, { stream: true }));
        for (const parsedData of chunk) {
          resultText += parsedData.generatedText;
          if (cb) {
            cb(parsedData.generatedText);
          }
        }
      } catch (error) {
        console.error('Error parsing JSON:', error);
        return; // Just log the error, without unnecessary return value
      }
    }

    if (done_cb) {
      done_cb(resultText);
    }
  } catch (error) {
    console.error('Error processing stream response:', error);
  }
};

export const HandleOpenAIResponse = async (streamResponse, cb: (streamText: string) => void, done_cb?: (result: string, thrID:string) => void) => {
  const reader = streamResponse.body?.getReader();
  const decoder = new TextDecoder("utf-8");
  let buffer = "";
  let threadId
  let resultText = "";

  if (!reader) { // normal response, not a stream
    cb(streamResponse.result)
    done_cb?.(streamResponse.result, streamResponse?.threadId || "");
    return;
  }

  // eslint-disable-next-line no-constant-condition
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer = decoder.decode(value, { stream: true });

    const lines = buffer.split("\n");
    buffer = lines.pop() ?? ""; // Keep the unfinished line for next chunk

    for (const line of lines) {
      if (line.startsWith("data: ")) {
        const jsonStr = line.replace(/^data: /, "").trim();
        if (jsonStr === "[DONE]") {
          done_cb?.(resultText, threadId);
          return;
        }
        try {
          const json = JSON.parse(jsonStr);
          threadId = json?.thread_id;

          // Handle OpenAI "thread.message.delta" format
          if (json.object === "thread.message.delta" && json.delta?.content) {
            for (const contentItem of json.delta.content) {
              if (
                contentItem.type === "text" &&
                contentItem.text &&
                typeof contentItem.text.value === "string"
              ) {
                cb(contentItem.text.value);
                resultText += contentItem.text.value;
              }
            }
          } else if (json.delta?.content) {
            // fallback for other formats
            const content = json.delta.content;
            if (typeof content === "string") {
              cb(content);
              resultText += content;
            }
          }
        } catch (e) {
          console.error("⚠️ OpenAI Stream parse error:", e);
        }
      }
    }
  }
}

export const HandleMistralAIResponse = async (streamResponse, cb: (streamText: string) => void, done_cb?: (result: string, thrID:string) => void) => {
  const reader = streamResponse.body?.getReader();
  const decoder = new TextDecoder("utf-8");
  let buffer = "";
  let threadId
  let resultText = "";

  if (!reader) { // normal response, not a stream
    cb(streamResponse.result)
    done_cb?.(streamResponse.result, streamResponse?.threadId || "");
    return;
  }

  // eslint-disable-next-line no-constant-condition
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer = decoder.decode(value, { stream: true });

    const lines = buffer.split("\n");
    buffer = lines.pop() ?? ""; // Keep the unfinished line for next chunk
    for (const line of lines) {
      if (line.startsWith("data: ")) {
        const jsonStr = line.replace(/^data: /, "").trim();
        try {
          const json = JSON.parse(jsonStr);
          threadId = json?.conversation_id || threadId;

          if (json.type === 'conversation.response.done') {
            done_cb?.(resultText, threadId);
            return;
          }

          if (typeof json.content === "string") {
            cb(json.content);
            resultText += json.content;
          }
        } catch (e) {
          console.error("⚠️ MistralAI Stream parse error:", e);
        }
      }
    }
  }
}

export const HandleAnthropicResponse = async (streamResponse, cb: (streamText: string) => void, done_cb?: (result: string, thrID:string) => void) => {
  const reader = streamResponse.body?.getReader();
  const decoder = new TextDecoder("utf-8");
  let buffer = "";
  let resultText = "";

  if (!reader) { // normal response, not a stream
    cb(streamResponse.result)
    done_cb?.(streamResponse.result, streamResponse?.threadId || "");
    return;
  }

  // eslint-disable-next-line no-constant-condition
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer = decoder.decode(value, { stream: true });
    const lines = buffer.split("\n");
    buffer = lines.pop() ?? ""; // Keep the unfinished line for next chunk
    for (const line of lines) {
      if (line.startsWith("data: ")) {
        const jsonStr = line.replace(/^data: /, "").trim();
        try {
          const json = JSON.parse(jsonStr);

          if (json.type === "message_stop"){
            done_cb?.(resultText, "");
            return;
          }

          if (json.type === "content_block_delta") {
            cb(json.delta.text);
            resultText += json.delta.text;
          }
        } catch (e) {
          console.error("⚠️ Anthropic Stream parse error:", e);
        }
      }
    }
  }
}
