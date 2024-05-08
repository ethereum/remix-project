declare module 'solhint' {
  export function processStr (inputStr: any, config?: any, fileName?: string)
  export function processFile (file: any, config: any)
  export function processPath (path: any, config: any)
}