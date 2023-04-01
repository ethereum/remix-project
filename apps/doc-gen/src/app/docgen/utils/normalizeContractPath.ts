export function normalizeContractPath(contractPath: string): string {
  let paths = contractPath.split('/')
  let filename = paths[paths.length - 1].split('.')[0]
  let folders = ''
  for (let i = 0; i < paths.length - 1; i++) {
    if(i !== paths.length -1) {
      folders += `${paths[i]}/`
    }
  }
  const resultingPath = `${folders}${filename}`
  // cleanup variables
  paths = null
  filename = null
  folders = null
  return resultingPath
}