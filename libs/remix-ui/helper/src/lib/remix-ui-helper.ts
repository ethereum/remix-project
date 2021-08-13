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
