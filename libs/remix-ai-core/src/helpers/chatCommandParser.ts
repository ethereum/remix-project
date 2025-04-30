import { GenerationParams } from "../types/models";

type CommandHandler = (args: string, reference) => void;

export class ChatCommandParser {
  private commands: Map<string, CommandHandler> = new Map();
  private props

  constructor(props) {
    this.registerDefaultCommands();
    this.props = props;
  }

  private registerDefaultCommands() {
    this.register("@generate", this.handleGenerate);
    this.register("@workspace", this.handleWorkspace);
    this.register("@setAssistant", this.handleAssistant);
    this.register("/generate", this.handleGenerate);
    this.register("/workspace", this.handleWorkspace);
    this.register("/setAssistant", this.handleAssistant);
    // Add more default commands as needed
  }

  public register(command: string, handler: CommandHandler) {
    this.commands.set(command.toLowerCase(), handler);
  }

  public async parse(input: string) {
    const commandPattern = /^[@/](\w+)\s*(.*)/;
    const match = input.match(commandPattern);

    if (!match) {
      console.log("No command found in input.");
      return "";
    }

    const commandName = `@${match[1].toLowerCase()}`;
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
    	return await ref.props.call('remixAI', 'generate', prompt, GenerationParams, "", true);
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

  private async handleAssistant(provider: string, ref) {
    if (provider === 'openai' || provider === 'mistralai' || provider === 'anthropic') {
      ref.props.assistantProvider = provider
      return "AI Provider set to `" + provider + "` successfully! "
    } else {
      return "Invalid AI Provider. Please use `openai`, `mistralai`, or `anthropic`."
    }
  }
}

