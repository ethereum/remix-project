export class fileSystem {
    name: string
    enabled: boolean
    available: boolean
    fs: any
    fsCallBack: any;
    hasWorkSpaces: boolean
    loaded: boolean
    load: () => Promise<unknown>
    test: () => Promise<unknown>

    constructor() {
        this.available = false
        this.enabled = false
        this.hasWorkSpaces = false
        this.loaded = false
    }
    ReadWriteTest = async () => {
        try {
            const str = 'Hello World'
            await this.fs.writeFile('/test.txt', str, 'utf8')
            if (await this.fs.readFile('/test.txt', 'utf8') === str) {
                console.log('Read/Write Test Passed')
                return true
            }
            await this.fs.remove('/test.txt', 'utf8')
        } catch (e) {
            console.log(e)
        }
        return false
    }

    checkWorkspaces = async () => {
        try {
            await this.fs.stat('.workspaces')
            this.hasWorkSpaces = true
        } catch (e) {

        }
    }

    set = async () => {
        const w = (window as any)
        if (!this.loaded) return false
        w.remixFileSystem = this.fs
        w.remixFileSystemCallback = this.fsCallBack
        return true
    }
}

export class fileSystems {
    fileSystems: Record<string, fileSystem>
    constructor() {
        this.fileSystems = {}
    }

    addFileSystem = async (fs: fileSystem) => {
        try {
            this.fileSystems[fs.name] = fs
            if (await fs.test()) await fs.load()
            console.log(fs.name + ' is loaded...')
            return true
        } catch (e) {
            console.log(fs.name + ' not available...')
            return false
        }
    }
    /**
     * sets filesystem using list as fallback
     * @param {string[]} names
     * @returns {Promise}
     */
    setFileSystem = async (filesystems?: fileSystem[]): Promise<fileSystem> => {
        for (const fs of filesystems) {
            if (this.fileSystems[fs.name]) {
                const result = await this.fileSystems[fs.name].set()
                if (result) return this.fileSystems[fs.name]
            }
        }
        return null
    }

    
}

