import { join, relative } from 'path'
import { workspace, } from 'vscode'

export function absolutePath(path: string) {
  path = path.replace(/^\/browser\//,"").replace(/^browser\//,"")
  const root = workspace.workspaceFolders[0].uri.fsPath
  // vscode API will never get permission to WriteFile outside of its workspace directory
  if(!root) {
    return path
  }
  if(path.startsWith(root)) {
    path = relative(root, path)
  }
  const result = join(root, path)
  if (!result.startsWith(root)) {
    throw new Error(`Resolved path is should be inside the open workspace : "${root}". Got "${result}`)
  }
  return result
}
  
export function relativePath(path) {
    const root = workspace.workspaceFolders[0].uri.fsPath
    // vscode API will never get permission to WriteFile outside of its workspace directory
    if (!root) {
        return path
    }
    return relative(root, path)
}

