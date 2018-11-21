const axios = require('axios')
const path = require('path')
const fs = require('fs')

const handleGithubCall = async function (fullpath, repoPath, path, filename, fileRoot) {
  const data = await axios({
    method: 'get',
    url: 'https://api.github.com/repos/' + repoPath + '/contents/' + path,
    responseType: 'json'
  }).then(function (response) {
    if ('content' in response.data) {
      const buf = Buffer.from(response.data.content, 'base64')
      fileRoot = fullpath.substring(0, fullpath.lastIndexOf('/'))
      fileRoot = fileRoot + '/'
      const resp = { filename, content: buf.toString('UTF-8'), fileRoot }
      return resp
    } else {
      throw Error('Content not received!')
    }
  })
  return data
}
const handleNodeModulesImport = async function (pathString, filename, fileRoot) {
  const o = { encoding: 'UTF-8' }
  var modulesDir = fileRoot

  while (true) {
    var p = path.join(modulesDir, 'node_modules', pathString, filename)
    try {
      const content = fs.readFileSync(p, o)
      fileRoot = path.join(modulesDir, 'node_modules', pathString)
      const response = { filename, content, fileRoot }
      return response
    } catch (err) {
      console.log(err)
    }

    // Recurse outwards until impossible
    var oldModulesDir = modulesDir
    modulesDir = path.join(modulesDir, '..')
    if (modulesDir === oldModulesDir) {
      break
    }
  }
}
const handleLocalImport = async function (pathString, filename, fileRoot) {
  // if no relative/absolute path given then search in node_modules folder
  if (pathString && pathString.indexOf('.') !== 0 && pathString.indexOf('/') !== 0) {
    return handleNodeModulesImport(pathString, filename, fileRoot)
  } else {
    const o = { encoding: 'UTF-8' }
    const p = pathString ? path.resolve(fileRoot, pathString, filename) : path.resolve(fileRoot, filename)
    const content = fs.readFileSync(p, o)
    fileRoot = pathString ? path.resolve(fileRoot, pathString) : fileRoot
    const response = { filename, content, fileRoot }
    return response
  }
}
const getHandlers = async function () {
  return [
    {
      type: 'local',
      match: /(^(?!(?:http:\/\/)|(?:https:\/\/)?(?:www.)?(?:github.com)))(^\/*[\w+-_/]*\/)*?(\w+\.sol)/g,
      handle: async (match, fileRoot) => { const data = await handleLocalImport(match[2], match[3], fileRoot); return data }
    },
    {
      type: 'github',
      match: /^(https?:\/\/)?(www.)?github.com\/([^/]*\/[^/]*)(.*\/(\w+\.sol))/g,
      handle: async (match, fileRoot) => {
        const data = await handleGithubCall(match[0], match[3], match[4], match[5], fileRoot)
        return data
      }
    }
  ]
}
const resolve = async function (fileRoot, sourcePath) {
  const handlers = await getHandlers()
  let response = {}
  for (const handler of handlers) {
    try {
      // here we are trying to find type of import path github/swarm/ipfs/local
      const match = handler.match.exec(sourcePath)
      if (match) {
        response = await handler.handle(match, fileRoot)
        break
      }
    } catch (e) {
      throw e
    }
  }
  return response
}

module.exports = resolve
