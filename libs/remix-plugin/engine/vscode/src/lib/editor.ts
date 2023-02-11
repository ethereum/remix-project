import { editorProfile, IEditor, Annotation, HighlightPosition } from '@remixproject/plugin-api';
import { MethodApi } from '@remixproject/plugin-utils';
import { window, Range, TextEditorDecorationType, Position, languages, DiagnosticCollection, Diagnostic, Uri, DiagnosticSeverity, TextEditor, ThemeColor } from "vscode";
import { CommandPlugin, CommandOptions } from "./command";
import { absolutePath } from '../util/path'

function getEditor(filePath?: string): TextEditor {
  const editors = window.visibleTextEditors;
  return filePath ? editors.find(editor => editor.document.uri.path === Uri.parse(filePath).path) : window.activeTextEditor
}

function extractColor(themeColor: string): string {
  const [content] = themeColor.match(/(?<=\().+?(?=\))/g);
  const value = content.substring(2);
  return value.split('-').join('.').replace('vscode.', '');
}

export interface EditorOptions extends CommandOptions {
  language: string;
}

export class EditorPlugin extends CommandPlugin implements MethodApi<IEditor> {
  private decoration: TextEditorDecorationType;
  private decorations: Array<TextEditorDecorationType>;
  private diagnosticCollection: DiagnosticCollection;
  public options: EditorOptions;

  constructor(options: EditorOptions) {
    super(editorProfile);
    super.setOptions(options);
    this.decorations = [];
  }
  setOptions(options: EditorOptions) {
    super.setOptions(options);
  }
  onActivation() {
    this.diagnosticCollection = languages.createDiagnosticCollection(this.options.language);
  }
  onDeactivation() {
    this.decoration.dispose();
  }
  async highlight(position: HighlightPosition, filePath: string, themeColor: string): Promise<void> {
    filePath = absolutePath(filePath)
    const editors = window.visibleTextEditors;
    // Parse `filePath` to ensure if a valid file path was supplied
    const editor = editors.find(editor => editor.document.uri.path === Uri.parse(filePath).path);
    if (editor) {
      const start: Position = new Position(position.start.line, position.start.column);
      const end: Position = new Position(position.end.line, position.end.column);
      const newDecoration = { range: new Range(start, end) };
      this.decoration = window.createTextEditorDecorationType({
        backgroundColor: new ThemeColor('editor.wordHighlightStrongBackground'),
        isWholeLine: true,
      });
      this.decorations.push(this.decoration);
      editor.setDecorations(this.decoration, [newDecoration]);
    } else {
      throw new Error(`Could not find file ${filePath}`);
    }
  }
  async discardDecorations(): Promise<void> {
    return this.decorations?.forEach(decoration => decoration.dispose());
  }
  async discardHighlight(): Promise<void> {
    return this.decorations?.forEach(decoration => decoration.dispose());
  }
  /**
   * Alisas of  discardHighlight
   * Required to match the standard interface of editor
   */
  async discardHighlightAt(): Promise<void> {
    return this.decoration.dispose();
  }
  async addAnnotation(annotation: Annotation, filePath?: string): Promise<void> {
    // This function should append to existing map
    // Ref: https://code.visualstudio.com/api/language-extensions/programmatic-language-features#provide-diagnostics
    // const fileUri = window.activeTextEditor ? window.activeTextEditor.document.uri : undefined; // TODO: we might want to supply path to addAnnotation function
    filePath = absolutePath(filePath)
    const editor = getEditor(filePath);
    const canonicalFile: string = editor.document.uri.fsPath;
    const diagnostics: Diagnostic[] = [];
    const range = new Range(annotation.row - 1, annotation.column, annotation.row - 1, annotation.column);
    const diagnosticSeverity: Record<string, DiagnosticSeverity> = {
      'error': DiagnosticSeverity.Error,
      'warning': DiagnosticSeverity.Warning,
      'information': DiagnosticSeverity.Information
    };
    const severity = diagnosticSeverity[annotation.type];
    const diagnostic = new Diagnostic(range, annotation.text, severity);
    diagnostics.push(diagnostic);
    this.diagnosticCollection.set(Uri.file(canonicalFile), diagnostics);
  }
  async clearAnnotations(): Promise<void> {
    return this.diagnosticCollection.clear();
  }

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  async gotoLine(line: number, col: number) { }
}
