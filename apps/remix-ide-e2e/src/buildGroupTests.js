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
    createTaggedTestFiles(file, content)
    createFiles(file, matches)
  }
})

function createFiles(file, matches, tag = false) {
  if (matches) {
    const unique = matches.filter(onlyUnique)
    unique.map((group) => {
      const rewrite = source.replace('#groupname', group).replace('#file', file.replace('.ts', ''))
      const extension = file.split('.')
      extension.shift()
      let filename
      if (!tag) {
        filename = `${testFolder}${file.split('.').shift()}_${group}.${extension.join('.')}`
      } else {
        filename = `${testFolder}${file.split('.').shift()}_${group}.${tag.toLowerCase()}.ts`
      }
      fs.writeFileSync(filename, rewrite)
    })
  }
}

function onlyUnique(value, index, self) {
  return self.indexOf(value) === index
}

function createTaggedTestFiles(file, text) {
  const lines = text.split('\n')
  lines.forEach((line) => {
    if (line.includes('#flaky') || line.includes('#pr') || line.includes('#PR')) {
      const matches = line.match(/group\d+/g)
      if (matches) {
        const tags = line.match(/#(flaky|pr|PR)/gi).map(t => t.replace('#', '').toLowerCase());
        tags.forEach(tag => {
          createFiles(file, matches, tag);
        });
      }
    }
  })
}
