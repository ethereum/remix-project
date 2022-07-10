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