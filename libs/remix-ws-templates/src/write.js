const fs = require('fs');
const path = require('path');

// helper to generate a template index.ts
const pathAbs = '' // absolute path to the template folder
let filesString = `export default async () => {
    return {`

function readDirectoryRecursively(directoryPath) {
  const files = fs.readdirSync(directoryPath);

  files.forEach(file => {
    const filePath = path.join(directoryPath, file);
    const stats = fs.statSync(filePath);

    if (stats.isDirectory()) {
      readDirectoryRecursively(filePath);
    } else {
        const rel = filePath.replace(pathAbs, '')
        filesString += `
        // @ts-ignore
        '${rel}': (await import('raw-loader!./${rel}')).default,`
    }
  });
}

readDirectoryRecursively('/home/yann/Remix/remix-project/libs/remix-ws-templates/src/templates/chainlink-ccip-semaphore');

filesString += `
 }
}`

console.log(filesString)