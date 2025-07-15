// Extract all imports from a given file content at the first level
import { CompilationResult, IExtractedImport } from '../types/types';
import { ImportExtractionSupportedFileExtensions } from '../types/types';

const extractImportsFromFile = (fileContent: string): IExtractedImport[] => {
  const imports: IExtractedImport[] = [];
  // Match both patterns: import "path"; and import {...} from "path";
  const importRegex = /import\s+(?:.*?\s+from\s+)?["']([^"']+)["'];?/g;
  let match: RegExpExecArray | null;

  while ((match = importRegex.exec(fileContent)) !== null) {
    const importPath = match[1];;
    const isLocal = importPath.startsWith('.') || importPath.startsWith('/');
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

export const extractFirstLvlImports = (AIPayload: any, compilationResult: CompilationResult): IExtractedImport[] => {
  try {
    const imports: IExtractedImport[] = [];
    if (!AIPayload || !AIPayload.files) return imports;
    for (const file of AIPayload.files) {
      if (!Object.values(ImportExtractionSupportedFileExtensions).some(ext => file.fileName.endsWith(ext))) continue;
      const extractedImports = extractImportsFromFile(file.content);
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
        if (compilationResult.compilerPayload && compilationResult.compilerPayload?.source?.sources) {
          return compilationResult.compilerPayload.source.sources[key]?.content || "Import not resolved";
        }
        return "Import not resolved";
      }
      uniqueImports[key].content = getFileContent();
      imports.push(uniqueImports[key]);
    }

    return imports;
  } catch {
    return [];
  }
}