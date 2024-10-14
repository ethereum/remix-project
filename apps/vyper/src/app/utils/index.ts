export * from './compiler'
export * from './remix-client'

export function contractName(fileName: string): string {
  const parts = fileName.split('/')
  return parts[parts.length - 1]
}

export function isVyper(name: string): boolean {
  const parts = name.split('.')
  return parts[parts.length - 1] === 'vy'
}

export function extractRelativePath(content: string, filePath: string): string {
  try {
    const regex = /(\/.*?\S*)/g
    const paths = content.match(regex)
    if (paths) {
      for (const absPath of paths) {
        if (absPath.indexOf(filePath) !== -1) {
          content = content.replace(absPath, filePath)
        }
      }
    }
  } catch (e) {
    console.error(e)
  }
  return content
}