import { isOllamaAvailable, listModels } from "../inferencers/local/ollama";
import { OllamaInferencer } from "../inferencers/local/ollamaInferencer";
import { GenerationParams } from "../types/models";

type CommandHandler = (args: string, reference: any) => void;

export class ChatCommandParser {
  private commands: Map<string, CommandHandler> = new Map();
  private props: any

  constructor(props: any) {
    this.registerDefaultCommands();
    this.props = props;
  }

  private registerDefaultCommands() {
    this.register("@generate", this.handleGenerate);
    this.register("@workspace", this.handleWorkspace);
    this.register("@setAssistant", this.handleAssistant);
    this.register("@ollama", this.handleOllama);
    this.register("/generate", this.handleGenerate);
    this.register("/g", this.handleGenerate);
    this.register("/workspace", this.handleWorkspace);
    this.register("/w", this.handleWorkspace);
    this.register("/setAssistant", this.handleAssistant);
    this.register("/continue", this.handleContinueGeneration);
    this.register("/c", this.handleContinueGeneration);
    // Add more default commands as needed
  }

  public register(command: string, handler: CommandHandler) {
    this.commands.set(command.toLowerCase(), handler);
  }

  public async parse(input: string) {
    const commandPattern = /^[@/](\w{1,})\s*(.*)/;
    const match = input.match(commandPattern);

    if (!match) {
      return "";
    }

    const commandName = `/${match[1].toLowerCase()}`;
    const rawArgs = match[2].trim();
    const strippedInput = input.slice(match[0].indexOf(match[2])).trim(); // remove command prefix

    const handler = this.commands.get(commandName);
    if (handler) {
      return handler(rawArgs, this);
    } else {
      console.log(`Unknown command: ${commandName}`);
      return "";
    }
  }

  private async handleGenerate(prompt: string, ref) {
    try {
      GenerationParams.return_stream_response = false
      GenerationParams.stream_result = false
    	return await ref.props.call('remixAI', 'generate', "generate " + prompt, GenerationParams, "", true);
    } catch (error) {
      return "Generation failed. Please try again.";
    }
  }

  private async handleWorkspace(prompt: string, ref) {
    try {
      GenerationParams.return_stream_response = false
      GenerationParams.stream_result = false
      return await ref.props.call('remixAI', 'generateWorkspace', prompt, GenerationParams, "", false);
    } catch (error) {
      return "Workspace generation failed. Please try again.";
    }
  }

  private async handleContinueGeneration(prompt: string, ref) {
    try {
      GenerationParams.return_stream_response = false
      GenerationParams.stream_result = false
      return await ref.props.call('remixAI', 'fixWorspaceErrors', true);
    } catch (error) {
      return "Error while generating. Please try again.";
    }
  }

  private async handleAssistant(provider: string, ref) {
    if (provider === 'openai' || provider === 'mistralai' || provider === 'anthropic') {
      await ref.props.call('remixAI', 'setAssistantProvider', provider);
      return "AI Provider set to `" + provider + "` successfully! "
    } else {
      return "Invalid AI Provider. Please use `openai`, `mistralai`, or `anthropic`."
    }
  }

  private async handleOllama(prompt: string, ref: any) {
    try {
      if (prompt === "start") {
        const available = await isOllamaAvailable();
        if (!available) {
          return '❌ Ollama is not available. Consider enabling the (Ollama CORS)[https://objectgraph.com/blog/ollama-cors/]'
        }
        const models = await listModels();
        const res = "Available models: " + models.map((model: any) => `\`${model}\``).join("\n");
        return res + "\n\nOllama is now set up. You can use the command `/ollama select <model>` to start a conversation with a specific model. Make sure the model is being run on your local machine. See ollama run <model> for more details.";
      } else if (prompt.trimStart().startsWith("select")) {
        const model = prompt.split(" ")[1];
        if (!model) {
          return "Please provide a model name to select.";
        }
        const available = await isOllamaAvailable();
        if (!available) {
          return '❌ Ollama is not available. Consider enabling the (Ollama CORS)[https://objectgraph.com/blog/ollama-cors/]'
        }
        const models = await listModels();
        if (models.includes(model)) {
          // instantiate ollama in remixai
          ref.props.remoteInferencer = new OllamaInferencer()
          ref.props.remoteInferencer.event.on('onInference', () => {
            ref.props.isInferencing = true
          })
          ref.props.remoteInferencer.event.on('onInferenceDone', () => {
            ref.props.isInferencing = false
          })
          return `Model set to \`${model}\`. You can now start chatting with it.`;
        } else {
          return `Model \`${model}\` is not available. Please check the list of available models.`;
        }
      } else if (prompt === "stop") {
        return "Ollama generation stopped.";
      } else {
        return "Invalid command. Use `/ollama start` to initialize Ollama, `/ollama select <model>` to select a model, or `/ollama stop` to stop the generation.";
      }
    } catch (error) {
      return "Ollama generation failed. Please try again.";
    }
  }
}

