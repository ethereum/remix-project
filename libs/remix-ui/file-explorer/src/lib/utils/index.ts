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
