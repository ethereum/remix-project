const testFolder = './apps/remix-ide-e2e/src/tests/'
const fs = require('fs')

// build group tests

const source = `'use strict'
import * as test from './#file'
import buildGroupTest from '../helpers/buildgrouptest'
const group = '#groupname'

module.exports = buildGroupTest(group, test)
`

fs.readdirSync(testFolder).forEach(file => {
  if (!file.includes('group')) {
    const content = fs.readFileSync(testFolder + file, 'utf8')
    const matches = content.match(/group\d+/g)
    createFlakyTestFiles(file, content)
    createFiles(file, matches)
  }
})

function createFiles(file, matches, flaky = false) {
  if (matches) {
    const unique = matches.filter(onlyUnique)
    unique.map((group) => {
      const rewrite = source.replace('#groupname', group).replace('#file', file.replace('.ts', ''))
      const extension = file.split('.')
      extension.shift()
      let filename
      if (!flaky) {
        filename = `${testFolder}${file.split('.').shift()}_${group}.${extension.join('.')}`
      } else {
        filename = `${testFolder}${file.split('.').shift()}_${group}.flaky.ts`
      }
      fs.writeFileSync(filename, rewrite)
    })
  }
}

function onlyUnique(value, index, self) {
  return self.indexOf(value) === index
}

function createFlakyTestFiles(file, text) {
  const lines = text.split('\n')
  lines.forEach((line, index) => {
    // if line contains #flaky
    if (line.includes('#flaky')) {
      const matches = line.match(/group\d+/g)
      const unique = matches.filter(onlyUnique)
      createFiles(file, matches, true)
    }
  })
}
