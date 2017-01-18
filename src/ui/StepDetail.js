'use strict'
var yo = require('yo-yo')
var DropdownPanel = require('./DropdownPanel')

function StepDetail (_parent, _traceManager) {
  this.parent = _parent
  this.traceManager = _traceManager

  this.basicPanel = new DropdownPanel('Step detail', {json: true})

  this.detail = initDetail()
  this.view
  this.init()
}

StepDetail.prototype.render = function () {
  return yo`<div id='stepdetail' >${this.basicPanel.render()}</div>`
}

StepDetail.prototype.init = function () {
  var self = this
  this.parent.event.register('traceUnloaded', this, function () {
    self.detail = initDetail()
    self.basicPanel.update(self.detail)
  })

  this.parent.event.register('newTraceLoaded', this, function () {
    self.detail = initDetail()
    self.basicPanel.update(self.detail)
  })

  this.parent.event.register('indexChanged', this, function (index) {
    if (index < 0) return

    self.detail['vm trace step'] = index

    self.traceManager.getCurrentStep(index, function (error, step) {
      if (error) {
        console.log(error)
        self.detail['execution step'] = '-'
      } else {
        self.detail['execution step'] = step
      }
      self.basicPanel.update(self.detail)
    })

    self.traceManager.getMemExpand(index, function (error, addmem) {
      if (error) {
        console.log(error)
        self.detail['add memory'] = '-'
      } else {
        self.detail['add memory'] = addmem
      }
      self.basicPanel.update(self.detail)
    })

    self.traceManager.getStepCost(index, function (error, gas) {
      if (error) {
        console.log(error)
        self.detail.gas = '-'
      } else {
        self.detail.gas = gas
      }
      self.basicPanel.update(self.detail)
    })

    self.traceManager.getCurrentCalledAddressAt(index, function (error, address) {
      if (error) {
        console.log(error)
        self.detail['loaded address'] = '-'
      } else {
        self.detail['loaded address'] = address
      }
      self.basicPanel.update(self.detail)
    })

    self.traceManager.getRemainingGas(index, function (error, remaingas) {
      if (error) {
        console.log(error)
        self.detail['remaining gas'] = '-'
      } else {
        self.detail['remaining gas'] = remaingas
      }
      self.basicPanel.update(self.detail)
    })
  })
}

module.exports = StepDetail

function initDetail () {
  return {
    'vm trace step': '-',
    'execution step': '-',
    'add memory': '',
    'gas': '',
    'remaining gas': '-',
    'loaded address': '-'
  }
}
