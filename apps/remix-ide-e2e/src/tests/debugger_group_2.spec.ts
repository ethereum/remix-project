'use strict'
import * as test from './debugger.spec'
import buildGroupTest from '../helpers/buildgrouptest'
const group = 'group2'

module.exports = buildGroupTest(group, test)
