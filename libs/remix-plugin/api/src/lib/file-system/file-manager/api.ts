import { Folder } from './type'
import { StatusEvents } from '@remixproject/plugin-utils'

export interface IFileSystem {
  events: {
    currentFileChanged: (file: string) => void
    fileSaved: (file: string) => void
    fileAdded: (file: string) => void
    folderAdded: (file: string) => void
    fileRemoved: (file: string) => void
    fileClosed: (file: string) => void
    noFileSelected: ()=> void
    fileRenamed: (oldName: string, newName:string, isFolder: boolean) => void
  } & StatusEvents
  methods: {
    /** Open the content of the file in the context (eg: Editor) */
    open(path: string): void
    /** Set the content of a specific file */
    writeFile(path: string, data: string): void
    /** Return the content of a specific file */
    readFile(path: string): string
    /** Change the path of a file */
    rename(oldPath: string, newPath: string): void
    /** Upsert a file with the content of the source file */
    copyFile(src: string, dest: string): void
    /** Create a directory */
    mkdir(path: string): void
    /** Get the list of files in the directory */
    readdir(path: string): string[]
    /** Removes a file or directory recursively */
    remove(path: string): void
    /** Get the name of the file currently focused if any */
    getCurrentFile(): string
    /** close all files */
    closeAllFiles(): void
    /** close a file */
    closeFile(): void
    // Old API
    /** @deprecated Use readdir */
    getFolder(path: string): Folder
    /** @deprecated Use readFile */
    getFile(path: string): string
    /** @deprecated Use writeFile */
    setFile(path: string, content: string): void
    /** @deprecated Use open */
    switchFile(path: string): void
  }
}
