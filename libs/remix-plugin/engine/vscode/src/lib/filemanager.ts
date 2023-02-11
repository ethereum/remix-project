import { filSystemProfile, IFileSystem } from '@remixproject/plugin-api'
import { MethodApi } from '@remixproject/plugin-utils'
import { window, workspace, Uri, commands, ViewColumn } from 'vscode'
import { CommandPlugin } from './command'
import { absolutePath, relativePath } from '../util/path'
import { getOpenedTextEditor } from '../util/editor'

export class FileManagerPlugin extends CommandPlugin implements MethodApi<IFileSystem> {
  constructor() {
    super(filSystemProfile)
  }
  /** Open the content of the file in the context (eg: Editor) */
  async open(path: string): Promise<void> {
    const absPath = absolutePath(path)
    const uri = Uri.file(absPath)
    return commands.executeCommand('vscode.open', uri, { viewColumn: ( getOpenedTextEditor()?.viewColumn || ViewColumn.One ) })
  }
  /** Set the content of a specific file */
  async writeFile(path: string, data: string): Promise<void> {
    const absPath = absolutePath(path)
    const uri = Uri.file(absPath)
    const encoder = new TextEncoder()
    const uint8Array = encoder.encode(data)
    this.logMessage(' is modifying ' + path)
    return workspace.fs.writeFile(uri, Uint8Array.from(uint8Array))
  }
  /** Return the content of a specific file */
  async readFile(path: string): Promise<string> {
    const absPath = absolutePath(path)
    const uri = Uri.file(absPath)
    return workspace.fs.readFile(uri).then(content => Buffer.from(content).toString("utf-8"))
  }
  /** Remove a file */
  async remove(path: string): Promise<void> {
    const absPath = absolutePath(path)
    const uri = Uri.file(absPath)
    this.logMessage(' is removing ' + path)
    return workspace.fs.delete(uri)
  }
  /** Change the path of a file */
  async rename(oldPath: string, newPath: string): Promise<void> {
    const source = Uri.file(absolutePath(oldPath))
    const target = Uri.file(absolutePath(newPath))
    this.logMessage(' is renaming ' + oldPath + ' to ' + newPath)
    return workspace.fs.rename(source, target)
  }
  /** Upsert a file with the content of the source file */
  async copyFile(src: string, dest: string): Promise<void> {
    const source = Uri.file(absolutePath(src))
    const target = Uri.file(absolutePath(dest))
    return workspace.fs.copy(source, target)
  }
  /** Create a directory */
  async mkdir(path: string): Promise<void> {
    const uri = Uri.file(absolutePath(path))
    this.logMessage(' is creating ' + path)
    return workspace.fs.createDirectory(uri)
  }
  /** Get the list of files in the directory */
  async readdir(path: string): Promise<string[]> {
    const absPath = absolutePath(path)
    const uri = Uri.file(absPath)
    return workspace.fs.readDirectory(uri).then(data => data.map(([path]) => path))
  }

  async getCurrentFile() {
    const fileName = (getOpenedTextEditor()?.document?.fileName || undefined)
    if(!fileName) throw new Error("No current file found.")
    return relativePath(fileName)
  }

  async closeFile() {
    return null
  }

  async closeAllFiles() {
    return null
  }

  logMessage(message){
    if(this.currentRequest && this.currentRequest.from)
      window.showInformationMessage(this.currentRequest.from + message);
  }
  // ------------------------------------------
  // Legacy API. To be removed.
  // ------------------------------------------
  getFile = this.readFile
  setFile = this.writeFile
  switchFile = this.open
  /** @deprecated Use readdir instead */
  getFolder(path: string): Promise<any> {
    throw new Error('Get folder is not supported anymore')
  }
}
