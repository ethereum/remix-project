// Extract all imports from a given file content at the first level
import { CompilationResult, IExtractedImport } from '../types/types';
import { ImportExtractionSupportedFileExtensions } from '../types/types';

export const extractImportsFromFile = (fileContent: string): IExtractedImport[] => {
  const imports: IExtractedImport[] = [];
  // Match both patterns: import "path"; and import {...} from "path";
  const importRegex = /import\s+(?:.*?\s+from\s+)?["']([^"']+)["'];?/g;
  let match: RegExpExecArray | null;

  while ((match = importRegex.exec(fileContent)) !== null) {
    const importPath = match[1];
    const isLocal = importPath.startsWith('.') || importPath.startsWith('/')|| !importPath.startsWith('@');
    const isLibrary = importPath.startsWith('@')

    imports.push({
      importPath,
      content: undefined,
      isLocal,
      isLibrary
    });
  }

  return imports;
}

export const extractFirstLvlImports = (files: any, compilerPayload): IExtractedImport[] => {
  try {
    const imports: IExtractedImport[] = [];
    if (!files) return imports;

    // Helper function to resolve relative paths
    const resolveImportPath = (importPath: string, currentFile: string): string => {
      if (importPath.startsWith('./') || importPath.startsWith('../')) {
        const currentDir = currentFile.substring(0, currentFile.lastIndexOf('/'));

        if (importPath.startsWith('./')) {
          // Same directory
          return currentDir + '/' + importPath.substring(2);
        } else if (importPath.startsWith('../')) {
          const parts = importPath.split('/');
          let resolvedDir = currentDir;

          for (const part of parts) {
            if (part === '..') {
              resolvedDir = resolvedDir.substring(0, resolvedDir.lastIndexOf('/'));
            } else if (part !== '.') {
              resolvedDir += '/' + part;
            }
          }
          return resolvedDir;
        }
      }
      return importPath;
    };

    for (const file of files) {
      if (!Object.values(ImportExtractionSupportedFileExtensions).some(ext => file.fileName.endsWith(ext))) continue;
      const extractedImports = extractImportsFromFile(file.content);

      // Resolve relative paths for each import
      for (const imp of extractedImports) {
        imp.importPath = resolveImportPath(imp.importPath, file.fileName);
      }

      imports.push(...extractedImports);
    }

    // drop duplicated importPath
    const uniqueImports: { [key: string]: IExtractedImport } = {};
    for (const imp of imports) {
      if (!uniqueImports[imp.importPath]) {
        uniqueImports[imp.importPath] = imp;
      }
    }

    // convert back to array
    imports.length = 0;
    for (const key in uniqueImports) {
      const getFileContent = () => {
        if (compilerPayload && compilerPayload?.source?.sources) {
          return compilerPayload.source.sources[key]?.content || "Import not resolved";
        }
        return "Import not resolved";
      }

      const content = getFileContent();

      // Apply scaffolding for library imports
      if (uniqueImports[key].isLibrary) {
        uniqueImports[key].content = content;
        imports.push(uniqueImports[key]);
      }
    }

    return imports;
  } catch {
    return [];
  }
}