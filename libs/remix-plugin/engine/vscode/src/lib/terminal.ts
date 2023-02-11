import { Plugin } from "@remixproject/engine";
import { window, Terminal, OutputChannel } from 'vscode';

export interface TerminalOptions {
  name?: string
  open: boolean
}

function getOptions(params: Partial<TerminalOptions> = {}): TerminalOptions {
  return {
    open: true,
    ...params
  }
}

export class TerminalPlugin extends Plugin {
  // Terminals (stdin) created during activation 
  private terminals: Record<string, Terminal> = {};
  // Outputs (stdout) created during activation
  private outputs: Record<string, OutputChannel> = {};
  // Name of the active output
  private activeOutput: string;

  constructor() {
    super({ name: 'terminal', methods: ['write', 'exec', 'open', 'kill'] })
  }

  onDeactivation() {
    Object.values(this.terminals).forEach(terminal => terminal.dispose());
    this.terminals = {};
    Object.values(this.outputs).forEach(output => output.dispose());
    this.outputs = {};
  }

  private get active() {
    return window.activeTerminal;
  }

  private getTerminal(name?: string) {
    if (name) {
      const terminal = window.terminals.find(terminal => terminal.name === name);
      if (!terminal) {
        return this.terminals[name] = window.createTerminal(name);
      }
      return terminal || window.createTerminal(name);
    }
    return this.active;
  }
  
  private getOutput(name?: string) {
    name = name ?? this.activeOutput ?? 'plugin-engine';
    return this.outputs[name] ?? window.createOutputChannel(name);
  }

  /** Open specific terminal (doesn't work with output) */
  open(name?: string): string {
    const terminal = this.getTerminal(name);
    terminal.show(true);
    return terminal.name;
  }

  /** Kill a terminal */
  kill(name?: string) {
    if (name) {
      window.terminals.find(terminal => terminal.name === name)?.dispose();
      if (this.terminals[name]) {
        delete this.terminals[name];
      }
    } else {
      window.activeTerminal.dispose();
    }
  }

  /** Write on the current terminal and execute command */
  exec(command: string, options?: Partial<TerminalOptions>) {
    const opts = getOptions(options);
    const terminal = opts.name ? this.getTerminal(opts.name) : this.active;
    if (opts.open) {
      terminal.show(true);
    }
    terminal.sendText(command);
  }

  /** Write on the current output */
  write(text: string, options?: Partial<TerminalOptions>) {
    const opts = getOptions(options);
    const output = this.getOutput(opts.name);
    this.activeOutput = output.name;
    if (opts.open) {
      output.show(true);
    }
    output.appendLine(text);
  }
}
