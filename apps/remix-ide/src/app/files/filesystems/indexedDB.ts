import LightningFS from "@isomorphic-git/lightning-fs"
import { fileSystem } from "../fileSystem"

export class IndexedDBStorage extends LightningFS {
    base: LightningFS.PromisifedFS
    addSlash: (file: string) => string
    extended: { exists: (path: string) => Promise<unknown>; rmdir: (path: any) => Promise<void>; readdir: (path: any) => Promise<string[]>; unlink: (path: any) => Promise<void>; mkdir: (path: any) => Promise<void>; readFile: (path: any, options: any) => Promise<Uint8Array>; rename: (from: any, to: any) => Promise<void>; writeFile: (path: any, content: any, options: any) => Promise<void>; stat: (path: any) => Promise<import("fs").Stats>; init(name: string, opt?: LightningFS.FSConstructorOptions): void; activate(): Promise<void>; deactivate(): Promise<void>; lstat(filePath: string): Promise<import("fs").Stats>; readlink(filePath: string): Promise<string>; symlink(target: string, filePath: string): Promise<void> }
    constructor(name: string) {
        super(name)
        this.addSlash = (file) => {
            if (!file.startsWith('/')) file = '/' + file
            return file
        }
        this.base = this.promises
        this.extended = {
            ...this.promises,
            exists: async (path: string) => {
                return new Promise((resolve) => {
                    this.base.stat(this.addSlash(path)).then(() => resolve(true)).catch(() => resolve(false))
                })
            },
            rmdir: async (path) => {
                return this.base.rmdir(this.addSlash(path))
            },
            readdir: async (path) => {
                return this.base.readdir(this.addSlash(path))
            },
            unlink: async (path) => {
                return this.base.unlink(this.addSlash(path))
            },
            mkdir: async (path) => {
                return this.base.mkdir(this.addSlash(path))
            },
            readFile: async (path, options) => {
                return this.base.readFile(this.addSlash(path), options)
            },
            rename: async (from, to) => {
                return this.base.rename(this.addSlash(from), this.addSlash(to))
            },
            writeFile: async (path, content, options) => {
                return this.base.writeFile(this.addSlash(path), content, options)
            },
            stat: async (path) => {
                return this.base.stat(this.addSlash(path))
            }
        }
    }
}


export class indexedDBFileSystem extends fileSystem {
    constructor() {
        super()
        this.name = 'indexedDB'
    }

    load = async () => {
        return new Promise((resolve, reject) => {
            try {
                const fs = new IndexedDBStorage('RemixFileSystem')
                fs.init('RemixFileSystem')
                this.fs = fs.extended
                this.fsCallBack = fs
                this.loaded = true
                resolve(true)
            } catch (e) {
                reject(e)
            }
        })
    }

    test = async () => {
        return new Promise((resolve, reject) => {
            if (!window.indexedDB) {
                this.available = false
                reject('No indexedDB on window')
            }
            const request = window.indexedDB.open("RemixTestDataBase");
            request.onerror = () => {
                this.available = false
                reject('Error creating test database')
            };
            request.onsuccess = () => {
                window.indexedDB.deleteDatabase("RemixTestDataBase");
                this.available = true
                resolve(true)
            };
        })
    }

}