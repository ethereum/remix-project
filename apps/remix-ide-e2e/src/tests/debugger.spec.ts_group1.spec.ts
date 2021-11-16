'use strict'
import * as test from './debugger.spec'
import buildGroupTest from '../helpers/buildgrouptest'
const group = 'group1'

module.exports = buildGroupTest(group, test)