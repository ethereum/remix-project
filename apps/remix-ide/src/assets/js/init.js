/* eslint-disable prefer-promise-reject-errors */
function urlParams() {
  var qs = window.location.hash.substr(1)

  if (window.location.search.length > 0) {
    // use legacy query params instead of hash
    window.location.hash = window.location.search.substr(1)
    window.location.search = ''
  }

  var params = {}
  var parts = qs.split('&')
  for (var x in parts) {
    var keyValue = parts[x].split('=')
    if (keyValue[0] !== '') {
      params[keyValue[0]] = keyValue[1]
    }
  }
  return params
}
const defaultVersion = '0.8.0'
const versionToLoad = urlParams().appVersion ? urlParams().appVersion : defaultVersion

const assets = {
  '0.8.0': ['https://use.fontawesome.com/releases/v5.8.1/css/all.css', 'assets/css/pygment_trac.css'],
  '0.7.7': ['assets/css/font-awesome.min.css', 'assets/css/pygment_trac.css']
}
const versions = {
  '0.7.7': 'assets/js/0.7.7/app.js', // commit 7b5c7ae3de935e0ccc32eadfd83bf7349478491e
  '0.8.0': 'main.js'
}
for (const k in assets[versionToLoad]) {
  const app = document.createElement('link')
  app.setAttribute('rel', 'stylesheet')
  app.setAttribute('href', assets[versionToLoad][k])
  if (assets[versionToLoad][k] === 'https://use.fontawesome.com/releases/v5.8.1/css/all.css') {
    app.setAttribute('integrity', 'sha384-50oBUHEmvpQ+1lW4y57PTFmhCaXp0ML5d60M1M7uH2+nqUivzIebhndOJK28anvf')
    app.setAttribute('crossorigin', 'anonymous')
  }
  document.head.appendChild(app)
}

window.onload = () => {
  // eslint-disable-next-line no-undef
  class IndexedDBFS extends LightningFS {
    constructor(...t) {
      super(...t)
      this.addSlash = (file) => {
        if (!file.startsWith('/')) file = '/' + file
        return file
      }
      this.base = this.promises
      this.promises = {
        ...this.promises,

        exists: async (path) => {
          return new Promise((resolve, reject) => {
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

  function loadApp() {
    const app = document.createElement('script')
    app.setAttribute('src', versions[versionToLoad])
    document.body.appendChild(app)
  }

  async function ReadWriteTest(fs) {
    try {
      console.log(await fs.readdir('/'))
      const str = 'Hello World'
      await fs.writeFile('/test.txt', str , 'utf8')
      if(await fs.readFile('/test.txt', 'utf8') === str){
        console.log('Read/Write Test Passed')
      }
    } catch (e) {
      console.log(e)
    }
  }

  try {
    // localStorage
    // eslint-disable-next-line no-undef
    BrowserFS.install(window)
    // eslint-disable-next-line no-undef
    BrowserFS.configure({
      fs: 'LocalStorage'
    }, async function (e) {
      if (e) {
        console.log('BROWSEFS Error: ' + e)
      } else {
        window.remixLocalStorage = { ...window.require('fs') }
        window.remixLocalStorageCallBack = window.require('fs')
        window.remixLocalStorage.readdir = window.remixLocalStorage.readdirSync
        window.remixLocalStorage.readFile = window.remixLocalStorage.readFileSync
        window.remixLocalStorage.writeFile = window.remixLocalStorage.writeFileSync
        window.remixLocalStorage.stat = window.remixLocalStorage.statSync
        window.remixLocalStorage.unlink = window.remixLocalStorage.unlinkSync
        window.remixLocalStorage.rmdir = window.remixLocalStorage.rmdirSync
        window.remixLocalStorage.mkdir = window.remixLocalStorage.mkdirSync
        window.remixLocalStorage.rename = window.remixLocalStorage.renameSync
        window.remixLocalStorage.exists = window.remixLocalStorage.existsSync
        //loadApp()
        console.log('BrowserFS is ready!')
        await ReadWriteTest(window.remixLocalStorage)
      }
    })
  } catch (e) {
    console.log('BrowserFS is not ready!')
  }
  if (!window.indexedDB) {
    console.log("Your browser doesn't support a stable version of IndexedDB. Such and such feature will not be available.");
  }
  var request = window.indexedDB.open("RemixTestDataBase", 3);
  console.log(request)
  request.onerror = event => {
    // Do something with request.errorCode!
    console.log('INDEEDDB ERROR')
  };
  request.onsuccess = event => {
    // Do something with request.result!
    console.log("INDEEDDB SUCCESS")
    window.indexedDB.deleteDatabase("RemixTestDataBase");
    activateIndexedDB()
  };

  function activateIndexedDB() {
    // indexedDB
    window.remixIndexedDBCallBack = new IndexedDBFS()
    window.remixIndexedDBCallBack.init('RemixFileSystem').then(async () => {
      window.remixIndexedDB = window.remixIndexedDBCallBack.promises
      // check if .workspaces is present in indexeddb
      console.log('indexeddb ready')
      await ReadWriteTest(window.remixIndexedDB)
      window.remixIndexedDB.stat('.workspaces').then((dir) => {
        console.log(dir)
        // if (dir.isDirectory()) loadApp()
      }).catch((e) => {
        console.log('error creating .workspaces', e)
        // no indexeddb .workspaces -> run migration
        // eslint-disable-next-line no-undef
        //migrateFilesFromLocalStorage(loadApp)
      })
    }).catch((e) => {
      console.log('INDEEDDB ERROR: ' + e)
    })
  }
}
