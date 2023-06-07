import { ElectronPlugin } from '@remixproject/engine-electron';
import once from 'just-once';


let workingDir = null

const fixPath = (path: string) => {
  return path
}

function wrapCallback(opts, cb) {
  if (typeof opts === "function") {
    cb = opts;
  }
  cb = once(cb);
  const resolve = (...args) => cb(null, ...args)
  return [resolve, cb];
}

export class fsPlugin extends ElectronPlugin {
  public fs: any
  public fsSync: any

  constructor() {
    super({
      displayName: 'fs',
      name: 'fs',
      description: 'fs',
    })
    this.methods = ['readdir', 'readFile', 'writeFile', 'mkdir', 'rmdir', 'unlink', 'rename', 'stat', 'exists', 'setWorkingDir']

    // List of commands all filesystems are expected to provide. `rm` is not
    // included since it may not exist and must be handled as a special case
    const commands = [
      'readFile',
      'writeFile',
      'mkdir',
      'rmdir',
      'unlink',
      'stat',
      'lstat',
      'readdir',
      'readlink',
      'symlink',
    ]

    this.fs = {

      exists: async (path: string) => {
        path = fixPath(path)
        const exists = await this.call('fs', 'exists', path)
        return exists
      },
      rmdir: async (path: string) => {
        path = fixPath(path)
        return await this.call('fs', 'rmdir', path)

      },
      readdir: async (path: string) => {
        path = fixPath(path)
        console.log('readdir', path)
        const files = await this.call('fs', 'readdir', path)
        console.log('readdir', path, files)
        return files
      },
      unlink: async (path: string) => {
        path = fixPath(path)
        return await this.call('fs', 'unlink', path)
      },
      mkdir: async (path: string) => {
        path = fixPath(path)
        return await this.call('fs', 'mkdir', path)
      },
      readFile: async (path: string, options) => {
        console.log('readFile', path, options)
        path = fixPath(path)
        const file =  await this.call('fs', 'readFile', path)
        console.log('readFile', path, file)
        return file
      }
      ,
      rename: async (from: string, to: string) => {
        return await this.call('fs', 'rename', from, to)
      },
      writeFile: async (path: string, content: string) => {
        path = fixPath(path)
        return await this.call('fs', 'writeFile', path, content)
      }
      ,
      stat: async (path: string) => {
        path = fixPath(path)
        const stat = await this.call('fs', 'stat', path)
        stat.isDirectory = () => stat.isDirectoryValue
        stat.isFile = () => !stat.isDirectoryValue
        //console.log('stat', path, stat)
        return stat
      },
      lstat: async (path: string) => {
        path = fixPath(path)
        const stat = await this.call('fs', 'lstat', path)
        stat.isDirectory = () => stat.isDirectoryValue
        stat.isFile = () => !stat.isDirectoryValue
        //console.log('stat', path, stat)
        return stat
      },
      readlink: async (path: string) => {
        path = fixPath(path)
        return await this.call('fs', 'readlink', path)
      },
      symlink: async (target: string, path: string) => {
        path = fixPath(path)
        return await this.call('fs', 'symlink', target, path)
      }

      



    }






  }




  async onActivation() {
    console.log('fsPluginClient onload', this.fs);
    (window as any).remixFileSystem = this.fs;
    /*(window as any).remixFileSystemCallback = {
      readdir: (filepath, opts, cb) => {
        console.log('readdir', filepath, opts)
        const [resolve, reject] = wrapCallback(opts, cb);
        (window as any).remixFileSystem.fs.readdir(filepath, opts).then(resolve).catch(reject);
      },
      readFile: (filepath, opts, cb) => {
        console.log('readFile', filepath, opts)
        const [resolve, reject] = wrapCallback(opts, cb);
        (window as any).remixFileSystem.fs.readFile(filepath, opts).then(resolve).catch(reject)
      },
      writeFile: (filepath, content, opts, cb) => {
        const [resolve, reject] = wrapCallback(opts, cb);
        (window as any).remixFileSystem.fs.writeFile(filepath, content, opts).then(resolve).catch(reject)
      },
      mkdir: (filepath, opts, cb) => {
        const [resolve, reject] = wrapCallback(opts, cb);
        (window as any).remixFileSystem.fs.mkdir(filepath, opts).then(resolve).catch(reject)
      },
      rmdir: (filepath, opts, cb) => {
        const [resolve, reject] = wrapCallback(opts, cb);
        (window as any).remixFileSystem.fs.rmdir(filepath, opts).then(resolve).catch(reject)
      },
      unlink: (filepath, opts, cb) => {
        const [resolve, reject] = wrapCallback(opts, cb);
        (window as any).remixFileSystem.fs.unlink(filepath, opts).then(resolve).catch(reject)
      },
      stat: (filepath, opts, cb) => {
        const [resolve, reject] = wrapCallback(opts, cb);
        (window as any).remixFileSystem.fs.stat(filepath, opts).then(resolve).catch(reject)
      }
    };
    */

    this.on('fs', 'workingDirChanged', async (path: string) => {
      console.log('change working dir', path)
      workingDir = path
      await this.call('fileManager', 'refresh')
    })
  }

}