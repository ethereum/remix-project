const getFile = function (path, sources) {
  return sources[path].content
}

module.exports = getFile
