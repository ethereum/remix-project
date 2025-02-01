// Noir Circuit Program Parser
// Detects syntax errors and warnings in .nr files

class NoirParser {
  errors: any;
  currentLine: any;
  currentColumn: number;
  constructor() {
    this.errors = [];
    this.currentLine = 1;
    this.currentColumn = 1;
  }

  parseNoirCode(code) {
    this.errors = [];
    this.currentLine = 1;
    this.currentColumn = 1;

    const lines = code.split('\n');
    let inFunctionBody = false;

    for (let lineIdx = 0; lineIdx < lines.length; lineIdx++) {
      const line = lines[lineIdx].trim();

      // Skip empty lines or comments
      if (line === '' || line.startsWith('//')) {
        this.currentLine++;
        continue;
      }

      // Track function body
      if (line.includes('{')) {
        inFunctionBody = true;
      } else if (line.includes('}')) {
        inFunctionBody = false;
      }

      // Check for multiple semicolons
      const semicolonMatches = [...line.matchAll(/;/g)];
      if (semicolonMatches.length > 1) {
        this.addError(
          'Multiple semicolons in a single statement',
          lineIdx + 1,
          semicolonMatches[1].index + 1,
          [lineIdx + 1, line.length]
        );
      }

      // Check module imports
      if (line.startsWith('mod ')) {
        const modulePattern = /^mod\s+[a-zA-Z_][a-zA-Z0-9_]*\s*;?$/;
        if (!modulePattern.test(line)) {
          this.addError(
            'Invalid module import syntax',
            lineIdx + 1,
            1,
            [lineIdx + 1, line.length]
          );
        }
      }

      // Check statement semicolons
      if (inFunctionBody &&
              !line.endsWith('{') &&
              !line.endsWith('}') &&
              !line.startsWith('fn ') &&
              !line.startsWith('//') &&
              !line.endsWith(';') &&
              line.length > 0) {
        this.addError(
          'Missing semicolon at statement end',
          lineIdx + 1,
          line.length,
          [lineIdx + 1, line.length]
        );
      }

      // Check for trailing whitespace
      if (lines[lineIdx].endsWith(' ')) {
        this.addError(
          'Trailing whitespace',
          lineIdx + 1,
          lines[lineIdx].length,
          [lineIdx + 1, lines[lineIdx].length]
        );
      }

      this.currentLine++;
    }

    return this.errors;
  }

  addError(message, line, column, range) {
    this.errors.push({
      message,
      line,
      column,
      range: range || [line, column]
    });
  }
}

export default NoirParser;