
/** Create a method path based on the method name and the path */
export function getMethodPath(method: string, path?: string) {
  if (!path) {
    return method
  }
  const part = path.split('.')
  part.shift()
  part.push(method)
  return part.join('.')
}

/** Get the root name of a path */
export function getRootPath(path: string) {
  return path.split('.').shift()
}