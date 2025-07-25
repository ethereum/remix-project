export class CodeCompletionAgent {
  props: any;

  constructor(props) {
    this.props = props;
  }

  async getLocalImports(fileContent: string, currentFile: string) {
    try {
      const lines = fileContent.split('\n');
      const imports = [];

      for (const line of lines) {
        const trimmedLine = line.trim();
        if (trimmedLine.startsWith('import')) {
          const importMatch = trimmedLine.match(/import\s+(?:.*\s+from\s+)?["']([^"']+)["']/);
          if (importMatch) {
            let importPath = importMatch[1];

            // Skip library imports (npm packages, node_modules, etc.)
            if (importPath.startsWith('@') ||
                (!importPath.startsWith('./') && !importPath.startsWith('../') && !importPath.startsWith('/'))) {
              continue;
            }

            // Handle relative imports
            if (importPath.startsWith('./') || importPath.startsWith('../')) {
              const currentDir = currentFile.includes('/') ? currentFile.substring(0, currentFile.lastIndexOf('/')) : '';
              importPath = this.resolvePath(currentDir, importPath);
            }

            imports.push(importPath);
          }
        }
      }

      return imports;
    } catch (error) {
      return [];
    }
  }

  resolvePath(currentDir: string, relativePath: string): string {
    const parts = currentDir.split('/').filter(part => part !== '');
    const relativeParts = relativePath.split('/').filter(part => part !== '');

    for (const part of relativeParts) {
      if (part === '..') {
        parts.pop();
      } else if (part !== '.') {
        parts.push(part);
      }
    }

    return parts.length > 0 ? parts.join('/') : relativePath;
  }

  async getContextFiles() {
    try {
      const currentFile = await this.props.call('fileManager', 'getCurrentFile');
      const currentFileContent = await this.props.call('fileManager', 'readFile', currentFile);

      const localImports = await this.getLocalImports(currentFileContent, currentFile);

      // Only return context files that are actually imported by the current file
      const fileContentPairs = [];
      for (const importPath of localImports) {
        try {
          const content = await this.props.call('fileManager', 'readFile', importPath);
          fileContentPairs.push({ file: importPath, content: content });
        } catch (error) {
          continue;
        }
      }

      return fileContentPairs;
    } catch (error) {
      return [];
    }
  }
}
