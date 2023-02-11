import { TextEditor, window } from 'vscode';

export function getOpenedTextEditor() {
  if (!window.activeTextEditor) {
    return getTextEditorWithDocumentType('file');
  } else {
    return window.activeTextEditor;
  }
}

export function getTextEditorWithDocumentType(type: string) {
  const editors: TextEditor[] = window.visibleTextEditors;
  const fileEditor: TextEditor = editors.find(
    (editor) =>
      editor.document &&
      editor.document.uri &&
      editor.document.uri.scheme &&
      editor.document.uri.scheme == type
  );
  return fileEditor;
}
