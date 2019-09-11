'use strict'
import * as packageJson from '../../../package.json'

class FileProvider {
  constructor () {
    super(profile)
  }


exists (path, cb) { throw new Error(this.name + ' function is not implemented for ' + this.constructor.name + ' class'); }

init (cb) { throw new Error(this.name + ' function is not implemented for ' + this.constructor.name + ' class'); }

get (path, cb) { throw new Error(this.name + ' function is not implemented for ' + this.constructor.name + ' class'); }

set (path, content, cb) { throw new Error(this.name + ' function is not implemented for ' + this.constructor.name + ' class'); }

addReadOnly (path, content) { throw new Error(this.name + ' function is not implemented for ' + this.constructor.name + ' class'); }

isReadOnly (path) { throw new Error(this.name + ' function is not implemented for ' + this.constructor.name + ' class'); }

remove (path) { throw new Error(this.name + ' function is not implemented for ' + this.constructor.name + ' class'); }

rename (oldPath, newPath, isFolder) { throw new Error(this.name + ' function is not implemented for ' + this.constructor.name + ' class'); }

resolveDirectory (path, callback) { throw new Error(this.name + ' function is not implemented for ' + this.constructor.name + ' class'); }

removePrefix (path) { throw new Error(this.name + ' function is not implemented for ' + this.constructor.name + ' class'); }

updateRefs (path, type) { throw new Error(this.name + ' function is not implemented for ' + this.constructor.name + ' class'); }

}

module.exports = FileProvider