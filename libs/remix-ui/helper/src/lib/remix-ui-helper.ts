export const extractNameFromKey = (key: string): string => {
  const keyPath = key.split('/')

  return keyPath[keyPath.length - 1]
}

export const extractParentFromKey = (key: string):string => {
  if (!key) return
  const keyPath = key.split('/')
  keyPath.pop()

  return keyPath.join('/')
}

export const checkSpecialChars = (name: string) => {
  return name.match(/[:*?"<>\\'|]/) != null
}

export const checkSlash = (name: string) => {
  return name.match(/\//) != null
}

export const createNonClashingNameAsync = async (name, fileManager, prefix = '') => {
  if (!name) name = 'Undefined'
  let counter
  let ext = 'sol'
  const reg = /(.*)\.([^.]+)/g
  const split = reg.exec(name)
  if (split) {
    name = split[1]
    ext = split[2]
  }
  let exist = true

  do {
    const isDuplicate = await fileManager.exists(name + counter + prefix + '.' + ext)

    if (isDuplicate) counter = (counter | 0) + 1
    else exist = false
  } while (exist)

  return name + counter + prefix + '.' + ext
}
