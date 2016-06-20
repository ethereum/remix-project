/* global describe it*/
var should = require('should')

var init = require('../src/helpers/init')
describe('index', function () {
  describe('loadContext', function () {
    it('web3', function () {
      var context = init.loadContext()
      should.exist(context.web3)
    })
  })
})
