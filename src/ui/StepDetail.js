'use strict'
var yo = require('yo-yo')
var DropdownPanel = require('./DropdownPanel')

function StepDetail (_parent, _traceManager) {
  this.parent = _parent
  this.traceManager = _traceManager

  this.basicPanel = new DropdownPanel('Step detail')

  this.detail = initDetail()
  this.view
  this.init()
}

StepDetail.prototype.render = function () {
  return yo`<div id='stepdetail' >${this.basicPanel.render()}</div>`
}

StepDetail.prototype.init = function () {
  var self = this
  this.parent.register('traceUnloaded', this, function () {
    self.detail = initDetail()
    self.basicPanel.update(self.detail)
  })

  this.parent.register('newTraceLoaded', this, function () {
    self.detail = initDetail()
    self.basicPanel.update(self.detail)
  })

  this.parent.register('indexChanged', this, function (index) {
    if (index < 0) return

    self.detail.vmTraceStep = index

    self.traceManager.getCurrentStep(index, function (error, step) {
      if (error) {
        console.log(error)
        self.detail.step = '-'
      } else {
        self.detail.step = step
      }
      self.basicPanel.update(self.detail)
    })

    self.traceManager.getMemExpand(index, function (error, addmem) {
      if (error) {
        console.log(error)
        self.detail.addmemory = '-'
      } else {
        self.detail.addmemory = addmem
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
        self.detail.loadedAddress = '-'
      } else {
        self.detail.loadedAddress = address
      }
      self.basicPanel.update(self.detail)
    })

    self.traceManager.getRemainingGas(index, function (error, remaingas) {
      if (error) {
        console.log(error)
        self.detail.remainingGas = '-'
      } else {
        self.detail.remainingGas = remaingas
      }
      self.basicPanel.update(self.detail)
    })
  })
}

module.exports = StepDetail

function initDetail () {
  return {
    vmTraceStep: '-',
    step: '-',
    addmemory: '',
    gas: '',
    remainingGas: '-',
    loadedAddress: '-'
  }
}
