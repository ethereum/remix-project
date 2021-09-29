// eslint-disable-next-line no-unused-vars
async function migrateFilesFromLocalStorage (cb) {
  let testmigration = false // migration loads test data into localstorage with browserfs
  // indexeddb will be empty by this point, so there is no danger but do a check for the origin to load test data so it runs only locally
  testmigration = window.location.hash.includes('e2e_testmigration=true') && window.location.host === '127.0.0.1:8080' && window.location.protocol === 'http:'
  // eslint-disable-next-line no-undef
  BrowserFS.install(window)
  // eslint-disable-next-line no-undef
  BrowserFS.configure({
    fs: 'LocalStorage'
  }, async function (e) {
    if (e) console.log(e)

    const browserFS = window.require('fs')

    /**
      * copy the folder recursively (internal use)
      * @param {string} path is the folder to be copied over
      * @param {Function} visitFile is a function called for each visited files
      * @param {Function} visitFolder is a function called for each visited folders
      */
    async function _copyFolderToJsonInternal (path, visitFile, visitFolder, fs) {
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
                  file.children = await _copyFolderToJsonInternal(curPath, visitFile, visitFolder, fs)
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
    async function copyFolderToJson (path, visitFile, visitFolder, fs) {
      visitFile = visitFile || (() => { })
      visitFolder = visitFolder || (() => { })
      return _copyFolderToJsonInternal(path, visitFile, visitFolder, fs)
    }

    const populateWorkspace = async (json, fs) => {
      for (const item in json) {
        const isFolder = json[item].content === undefined
        if (isFolder) {
          await createDir(item, fs)
          await populateWorkspace(json[item].children, fs)
        } else {
          try {
            await fs.writeFile(item, json[item].content, 'utf8')
          } catch (error) {
            console.log(error)
          }
        }
      }
    }

    const createDir = async (path, fs) => {
      const paths = path.split('/')
      if (paths.length && paths[0] === '') paths.shift()
      let currentCheck = ''
      for (const value of paths) {
        currentCheck = currentCheck + (currentCheck ? '/' : '') + value
        if (!await fs.exists(currentCheck)) {
          try {
            await fs.mkdir(currentCheck)
          } catch (error) {
            console.log(error)
          }
        }
      }
    }
    //
    if (testmigration) await populateWorkspace(testData, browserFS)
    const files = await copyFolderToJson('/', null, null, browserFS)
    await populateWorkspace(files, window.remixFileSystem)
    // eslint-disable-next-line no-undef
    if (cb) cb()
  })
}

/* eslint-disable no-template-curly-in-string */
const testData = {
  '.workspaces': {
    children: {
      '.workspaces/default_workspace': {
        children: {
          '.workspaces/default_workspace/README.txt': {
            content: 'TEST README'
          }
        }
      },
      '.workspaces/workspace_test': {
        children: {
          '.workspaces/workspace_test/TEST_README.txt': {
            content: 'TEST README'
          },
          '.workspaces/workspace_test/test_contracts': {
            children: {
              '.workspaces/workspace_test/test_contracts/1_Storage.sol': {
                content: 'testing'
              },
              '.workspaces/workspace_test/test_contracts/artifacts': {
                children: {
                  '.workspaces/workspace_test/test_contracts/artifacts/Storage_metadata.json': {
                    content: '{ "test": "data" }'
                  }
                }
              }
            }
          }
        }
      }
    }
  }
}
