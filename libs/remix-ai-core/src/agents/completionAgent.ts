import lunr from 'lunr';
import { extractImportsFromFile } from "../helpers/localImportsExtractor";

interface Document {
  id: number;
  filename: string;
  content: string;
  identifier: number;
}

interface indexT{
  isIndexed: boolean;
  lastIndexedTime?: number;
  reason?: string;
}

enum SupportedFileExtensions {
  solidity = '.sol',
  vyper = '.vy',
  circom = '.circom',
  javascript = '.js',
  typescript = '.ts',
  tests_ts = '.test.ts',
  tests_js = '.test.js',
}

export class CodeCompletionAgent {
  props: any;

  constructor(props) {
    this.props = props;
  }

  async getLocalImports(fileContent: string, currentFile: string) {
    try {
      // Use extractImportsFromFile to get all imports from the current file
      const imports = extractImportsFromFile(fileContent);
      const localImports = imports.filter(imp => imp.isLocal);
      return localImports.map(imp => imp.importPath);
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
