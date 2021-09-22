class remixFileSystem extends LightningFS {
    constructor(...t) {
        super(...t)
        this.promises = {
            ...this.promises,
            exists: async (path) => {
                return new Promise((resolve, reject) => {
                    this.promises.stat(path).then(() => resolve(true)).catch(() => resolve(false))
                })
            },
            statSync: async (path) => {
                return new Promise((resolve, reject) => {
                    console.log("stat", path)
                    this.promises.stat(path).then((stat) => {
                        console.log("stat", stat)
                        resolve({
                            isDirectory: () => {
                                return stat.type === 'dir'
                            },
                            isFile: () => {
                                return stat.type === 'file'
                            },
                        })
                    }).catch(() => reject(false))
                })
            }
        }
    }
}