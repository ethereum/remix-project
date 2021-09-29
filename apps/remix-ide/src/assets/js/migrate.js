// eslint-disable-next-line no-unused-vars
async function migrateFilesFromLocalStorage (cb) {
  // eslint-disable-next-line no-undef
  BrowserFS.install(window)
  // eslint-disable-next-line no-undef
  BrowserFS.configure({
    fs: 'LocalStorage'
  }, async function (e) {
    if (e) console.log(e)

    const browserFS = require('fs')

    /**
      * copy the folder recursively (internal use)
      * @param {string} path is the folder to be copied over
      * @param {Function} visitFile is a function called for each visited files
      * @param {Function} visitFolder is a function called for each visited folders
      */
    async function _copyFolderToJsonInternal (path, visitFile, visitFolder) {
      const fs = browserFS
      visitFile = visitFile || (() => { })
      visitFolder = visitFolder || (() => { })
      return new Promise((resolve, reject) => {
        const json = {}
        if (fs.existsSync(path)) {
          try {
            const items = fs.readdirSync(path)
            visitFolder({ path })
            if (items.length !== 0) {
              items.forEach(async (item, index) => {
                const file = {}
                const curPath = `${path}${path.endsWith('/') ? '' : '/'}${item}`
                if (fs.statSync(curPath).isDirectory()) {
                  file.children = await _copyFolderToJsonInternal(curPath, visitFile, visitFolder)
                } else {
                  file.content = fs.readFileSync(curPath, 'utf8')
                  visitFile({ path: curPath, content: file.content })
                }
                json[curPath] = file
              })
            }
          } catch (e) {
            console.log(e)
            return reject(e)
          }
        }
        return resolve(json)
      })
    }

    /**
       * copy the folder recursively
       * @param {string} path is the folder to be copied over
       * @param {Function} visitFile is a function called for each visited files
       * @param {Function} visitFolder is a function called for each visited folders
       */
    async function copyFolderToJson (path, visitFile, visitFolder) {
      visitFile = visitFile || (() => { })
      visitFolder = visitFolder || (() => { })
      return _copyFolderToJsonInternal(path, visitFile, visitFolder)
    }

    const populateWorkspace = async (json, browserProvider) => {
      for (const item in json) {
        const isFolder = json[item].content === undefined
        if (isFolder) {
          await createDir(item)
          await populateWorkspace(json[item].children, browserProvider)
        } else {
          try {
            await window.remixFileSystem.writeFile(item, json[item].content, 'utf8')
          } catch (error) {
            console.log(error)
          }
        }
      }
    }

    const createDir = async (path) => {
      const paths = path.split('/')
      if (paths.length && paths[0] === '') paths.shift()
      let currentCheck = ''
      for (const value of paths) {
        currentCheck = currentCheck + '/' + value
        if (!await window.remixFileSystem.exists(currentCheck)) {
          try {
            await window.remixFileSystem.mkdir(currentCheck)
          } catch (error) {
            console.log(error)
          }
        }
      }
    }

    const files = await copyFolderToJson('/')
    await populateWorkspace(files, window.remixFileSystem)
    // eslint-disable-next-line no-undef
    if (cb) cb()
  })
}
