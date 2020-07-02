
import { Storage } from 'remix-lib'

/*
  Migrating the files to the BrowserFS storage instead or raw localstorage
*/
export default (fileProvider) => {
  const fileStorage = new Storage('sol:')
  const flag = 'status'
  const fileStorageBrowserFS = new Storage('remix_browserFS_migration:')
  if (fileStorageBrowserFS.get(flag) === 'done') return
  fileStorage.keys().forEach((path) => {
    if (path !== '.remix.config') {
      const content = fileStorage.get(path)
      fileProvider.set(path, content)
      // TODO https://github.com/ethereum/remix-ide/issues/2377
      // fileStorage.remove(path) we don't want to remove it as we are still supporting the old version
      console.log('file migrated', path)
    }
  })
  fileStorageBrowserFS.set(flag, 'done')
}
