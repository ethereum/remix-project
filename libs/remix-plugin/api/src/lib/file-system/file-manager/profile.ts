import { IFileSystem } from './api'
import { LocationProfile, Profile } from '@remixproject/plugin-utils'

export const filSystemProfile: Profile<IFileSystem> & LocationProfile = {
  name: "fileManager",
  displayName: "Native Filemanager for Remix vscode plugin",
  description: "Provides communication between vscode filemanager and remix-plugin",
  location: "sidePanel",
  documentation: "https://remix-ide.readthedocs.io/en/latest/solidity_editor.html",
  version: "0.0.1",
  methods: [
    "getFolder",
    "getCurrentFile",
    "getFile",
    "setFile",
    "switchFile",
    // NextFileSystemAPI
    "open",
    "writeFile",
    "readFile",
    "rename",
    "copyFile",
    "mkdir",
    "readdir",
    "closeAllFiles",
    "closeFile",
    "remove",
  ],
  events: ['currentFileChanged', 'fileAdded', 'fileClosed', 'fileRemoved', 'fileRenamed', 'fileSaved', 'noFileSelected', 'folderAdded']
};