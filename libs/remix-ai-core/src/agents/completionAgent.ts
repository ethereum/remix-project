import * as fs from 'fs';

class CodeCompletionAgent {
  private codebase: string[];

  constructor(codebasePath: string) {
    // git or fs
    this.codebase = this.loadCodebase(codebasePath);
  }

  private loadCodebase(path: string): string[] {
    const files = fs.readdirSync(path);
    return files
      .filter(file => file.endsWith('.ts'))
      .flatMap(file => fs.readFileSync(`${path}/${file}`, 'utf-8').split('\n'));
  }

  public getSuggestions(currentLine: string, numSuggestions: number = 3): string[] {
    const suggestions: string[] = [];
    // get `numSuggestions` from the llm
    return suggestions;
  }
}
