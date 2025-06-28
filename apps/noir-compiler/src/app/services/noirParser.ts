class NoirParser {
  errors: {
    message: string;
    type: string;
    position: {
      start: { line: number; column: number };
      end: { line: number; column: number };
    };
  }[];
  currentLine: number;
  currentColumn: number;
  noirTypes: string[];

  constructor() {
    this.errors = [];
    this.currentLine = 1;
    this.currentColumn = 1;
    this.noirTypes = ['Field', 'bool', 'u8', 'u16', 'u32', 'u64', 'i8', 'i16', 'i32', 'i64'];
  }

  parseNoirCode(code) {
    this.errors = [];
    const lines = code.split('\n');
    const functions = this.analyzeFunctions(lines);

    for (let lineIdx = 0; lineIdx < lines.length; lineIdx++) {
      const line = lines[lineIdx];
      const trimmedLine = line.trim();

      if (trimmedLine === '' || trimmedLine.startsWith('//')) continue;
      if (trimmedLine.startsWith('mod ')) {
        this.checkModuleImport(trimmedLine, lineIdx, line);
        continue;
      }
      const currentFunction = functions.find(f => lineIdx >= f.startLine && lineIdx <= f.endLine);

      if (currentFunction) {
        if (lineIdx === currentFunction.startLine) this.checkFunctionReturnType(trimmedLine, lineIdx, line);
        else this.checkFunctionBodyStatement(trimmedLine, lineIdx, line, currentFunction, lines);
      }

      if (/[ \t]$/.test(line)) {
        this.addError({
          message: 'Trailing whitespace detected',
          type: 'style',
          position: this.calculatePosition(lineIdx, line.length - 1, line.length)
        });
      }
    }

    return this.errors;
  }

  analyzeFunctions(lines) {
    const functions = [];
    let currentFunction = null;
    let bracketCount = 0;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const codePart = line.split('//')[0].trim();

      if (codePart.startsWith('fn ')) {
        if (currentFunction !== null) {
          this.addError({
            message: 'Nested function definition not allowed',
            type: 'syntax',
            position: this.calculatePosition(i, 0, line.length)
          });
        }
        const fnMatch = codePart.match(/fn\s+([a-zA-Z_][a-zA-Z0-9_]*)/);

        if (!fnMatch) {
          this.addError({
            message: 'Invalid function name',
            type: 'syntax',
            position: this.calculatePosition(i, 0, line.length)
          });
          continue;
        }
        currentFunction = {
          startLine: i,
          name: fnMatch[1],
          returnType: this.extractReturnType(codePart),
          bracketCount: 0
        };
      }

      if (currentFunction) {
        const open = (codePart.match(/{/g) || []).length;
        const close = (codePart.match(/}/g) || []).length;

        bracketCount += open - close;
        if (bracketCount === 0) {
          currentFunction.endLine = i;
          functions.push({ ...currentFunction });
          currentFunction = null;
        }
      }
    }

    return functions;
  }

  checkFunctionBodyStatement(line, lineIdx, originalLine, currentFunction, allLines) {
    if (line === '' || line.startsWith('//') || line === '{' || line === '}') return;
    const codePart = line.split('//')[0].trimEnd();
    const isLastStatement = this.isLastStatementInFunction(lineIdx, currentFunction, allLines);

    if (!isLastStatement && !codePart.endsWith(';') && !codePart.endsWith('{')) {
      const nextNonEmptyLine = this.findNextNonEmptyLine(lineIdx + 1, allLines);
      if (nextNonEmptyLine && !nextNonEmptyLine.trim().startsWith('//')) {
        this.addError({
          message: 'Missing semicolon at statement end',
          type: 'syntax',
          position: this.calculatePosition(
            lineIdx,
            originalLine.length,
            originalLine.length
          )
        });
      }
    }
    const semicolonMatches = [...codePart.matchAll(/;/g)];

    if (semicolonMatches.length > 1) {
      this.addError({
        message: 'Multiple semicolons in a single statement',
        type: 'syntax',
        position: this.calculatePosition(
          lineIdx,
          semicolonMatches[1].index,
          originalLine.length
        )
      });
    }
  }

  checkFunctionReturnType(line, lineIdx, originalLine) {
    const returnMatch = line.match(/->\s*([a-zA-Z_][a-zA-Z0-9_:<>, ]*)/);

    if (returnMatch) {
      const returnType = returnMatch[1].trim();

      // Check if it's a valid Noir type or a custom type
      if (!this.isValidNoirType(returnType)) {
        this.addError({
          message: `Potentially invalid return type: ${returnType}`,
          type: 'warning',
          position: this.calculatePosition(
            lineIdx,
            originalLine.indexOf(returnType),
            originalLine.indexOf(returnType) + returnType.length
          )
        });
      }
    }
  }

  isLastStatementInFunction(currentLine, currentFunction, lines) {
    for (let i = currentLine + 1; i <= currentFunction.endLine; i++) {
      const line = lines[i].trim();
      if (line && !line.startsWith('//') && line !== '}') {
        return false;
      }
    }
    return true;
  }

  findNextNonEmptyLine(startIndex, lines) {
    for (let i = startIndex; i < lines.length; i++) {
      const line = lines[i].trim();
      if (line && !line.startsWith('//')) {
        return line;
      }
    }
    return null;
  }

  checkModuleImport(line, lineIdx, originalLine) {
    const modulePattern = /^mod\s+([a-zA-Z_][a-zA-Z0-9_]*)\s*;?$/;
    const match = line.match(modulePattern);

    if (!match) {
      this.addError({
        message: 'Invalid module import syntax',
        type: 'syntax',
        position: this.calculatePosition(lineIdx, 0, originalLine.length)
      });
    } else if (!line.endsWith(';')) {
      this.addError({
        message: 'Missing semicolon after module import',
        type: 'syntax',
        position: this.calculatePosition(
          lineIdx,
          originalLine.length,
          originalLine.length
        )
      });
    }
  }

  isValidNoirType(type) {
    // Handle visibility modifiers (pub/priv) and extract base type
    const typeParts = type.split(/\s+/);
    const baseType = typeParts[typeParts.length - 1]; // Get last part after any modifiers

    if (this.noirTypes.includes(baseType)) return true;
    if (baseType.includes('[') && baseType.includes(']')) {
      const innerTypeMatch = baseType.match(/\[(.*?);/);
      if (innerTypeMatch) {
        const innerType = innerTypeMatch[1].trim();
        return this.noirTypes.includes(innerType);
      }
      return false;
    }
    return false;
  }

  extractReturnType(line) {
    const returnMatch = line.match(/->\s*((?:pub\s+)?[a-zA-Z_][a-zA-Z0-9_:<>, ]*)/);
    return returnMatch ? returnMatch[1].trim() : null;
  }

  calculatePosition(line, startColumn, endColumn) {
    return {
      start: {
        line: line + 1,
        column: startColumn + 1
      },
      end: {
        line: line + 1,
        column: endColumn + 1
      }
    };
  }

  addError(error) {
    this.errors.push(error);
  }
}

export default NoirParser;
