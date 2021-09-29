/* eslint-disable prefer-promise-reject-errors */
function urlParams () {
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
  class RemixFileSystem extends LightningFS {
    constructor (...t) {
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

  function loadApp () {
    const app = document.createElement('script')
    app.setAttribute('src', versions[versionToLoad])
    document.body.appendChild(app)
  }
  const queryString = window.location.hash
  window.testmigration = queryString.includes('testmigration')
  window.remixFileSystemCallback = new RemixFileSystem()
  window.remixFileSystemCallback.init('RemixFileSystem', { wipe: !!window.testmigration }).then(() => {
    window.remixFileSystem = window.remixFileSystemCallback.promises
    // check if .workspaces is present in indexeddb
    window.remixFileSystem.stat('.workspaces').then((dir) => {
      if (dir.isDirectory()) loadApp()
    }).catch(() => {
      // no indexeddb workspaces
      // eslint-disable-next-line no-undef
      migrateFilesFromLocalStorage(loadApp)
    })
  })
}
