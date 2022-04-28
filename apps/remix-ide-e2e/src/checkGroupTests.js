const testFolder = './apps/remix-ide-e2e/src/tests/'
const fs = require('fs')

fs.readdirSync(testFolder).forEach(file => {
  if (!file.includes('group')) {
    const content = fs.readFileSync(testFolder + file, 'utf8')
    const matches = content.match(/group\d+/g)
    if (matches) {
      const disabled = content.includes('\'@disabled\': true') || content.includes('\'@disabled\':true')
      if (!disabled) {
        console.log(`WARNING ${file} has group tests but is not disabled`)
      }
    }
  }
})
