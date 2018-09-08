'use strict'
var yo = require('yo-yo')
var DropdownPanel = require('./DropdownPanel')

function StepDetail (_parentUI, _traceManager) {
  this.debugger = _parentUI.debugger
  this.parentUI = _parentUI
  this.traceManager = _traceManager

  this.basicPanel = new DropdownPanel('Step detail', {json: true, displayContentOnly: true})

  this.detail = {
    'vm trace step': '-', 'execution step': '-', 'add memory': '', 'gas': '', 'remaining gas': '-', 'loaded address': '-'
  }
  this.view
  this.init()
}

StepDetail.prototype.reset = function () {
  this.detail = {
    'vm trace step': '-', 'execution step': '-', 'add memory': '', 'gas': '', 'remaining gas': '-', 'loaded address': '-'
  }
  this.basicPanel.update(this.detail)
}

StepDetail.prototype.updateField = function (key, value) {
  this.detail[key] = value
  this.basicPanel.update(this.detail)
}

StepDetail.prototype.render = function () {
  return yo`<div id='stepdetail' >${this.basicPanel.render()}</div>`
}

StepDetail.prototype.init = function () {
  var self = this
  this.debugger.event.register('traceUnloaded', this, function () {
    self.reset()
  })

  this.debugger.event.register('newTraceLoaded', this, function () {
    self.reset()
  })

  this.parentUI.event.register('indexChanged', this, function (index) {
    if (index < 0) return

    self.updateField('vm trace step', index)

    self.traceManager.getCurrentStep(index, function (error, step) {
      self.updateField('execution step', (error ? '-' : step))
    })

    self.traceManager.getMemExpand(index, function (error, addmem) {
      self.updateField('add memory', (error ? '-' : addmem))
    })

    self.traceManager.getStepCost(index, function (error, gas) {
      self.updateField('gas', (error ? '-' : gas))
    })

    self.traceManager.getCurrentCalledAddressAt(index, function (error, address) {
      self.updateField('loaded address', (error ? '-' : address))
    })

    self.traceManager.getRemainingGas(index, function (error, remaingas) {
      self.updateField('remaining gas', (error ? '-' : remaingas))
    })
  })
}

module.exports = StepDetail
