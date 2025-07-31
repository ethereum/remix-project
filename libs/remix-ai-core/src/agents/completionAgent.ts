import { extractImportsFromFile } from "../helpers/localImportsExtractor";

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