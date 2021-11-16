const testFolder = './apps/remix-ide-e2e/src/tests/'
const fs = require('fs')
const path = require('path')

const source = `'use strict'
import * as test from './#file'
import buildGroupTest from '../helpers/buildgrouptest'
const group = '#groupname'

module.exports = buildGroupTest(group, test)`

fs.readdirSync(testFolder).forEach(file => {
  if (!file.includes('group')) {
    const content = fs.readFileSync(testFolder + file, 'utf8')
    let matches = content.match(/group\d+/g)
    if (matches) {
      const unique = matches.filter(onlyUnique);
      unique.map((group) => {
        const rewrite = source.replace('#groupname', group).replace('#file', file.replace('.ts', ''))
        const extension = file.split('.')
        extension.shift()
        const filename = `${testFolder}${file}_${group}.${extension.join('.')}`
        fs.writeFileSync(filename, rewrite)
      })
    }
  }
})

function onlyUnique(value, index, self) {
  return self.indexOf(value) === index;
}

