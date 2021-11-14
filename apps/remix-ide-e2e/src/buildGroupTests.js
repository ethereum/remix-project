const testFolder = './apps/remix-ide-e2e/src/tests/'
const fs = require('fs')

fs.readdirSync(testFolder).forEach(file => {
  console.log(file)
})
