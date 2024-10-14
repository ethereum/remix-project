// interactive code explaining and highlight security vunerabilities
import * as fs from 'fs';

class CodeExplainAgent {
  private codebase: string[]; // list of code base file
  public currentFile: string;

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

  public update(currentFile, lineNumber){

  }

  public getExplanations(currentLine: string, numSuggestions: number = 3): string[] {
    // process the code base explaining the current file and highlight some details
    const suggestions: string[] = [];
    return suggestions;
  }
}
