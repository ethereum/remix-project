
export function normalizeContractPath(contractPath: string): string[]{
  const paths = contractPath.split('/')
  const filename = paths[paths.length - 1]
  let folders = ''
  for (let i = 0; i < paths.length - 1; i++) {
    if(i !== paths.length -1) {
      folders += `${paths[i]}/`
    }
  }
  const resultingPath = `${folders}${filename}`
  return [folders,resultingPath, filename]
}
