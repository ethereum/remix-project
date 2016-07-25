'use strict'
var yo = require('yo-yo')

function Sticker (_parent, _traceManager) {
  this.parent = _parent
  this.traceManager = _traceManager

  this.vmTraceStep = '-'
  this.step = '-'
  this.addmemory = '-'
  this.gas = '-'
  this.remainingGas = '-'
  this.loadedAddress = '-'
  this.hide = true

  this.view
  this.init()
}

Sticker.prototype.render = function () {
  var view = yo`<div style=${this.hide ? 'display: none' : 'display: block'}>
    <table>
      <tbody>
        <tr key='vmtracestep'>
          <td>
            VMtracestep:
          </td>
          <td id='vmtracestepinfo' >
            ${this.vmTraceStep}
          </td>
        </tr>
        <tr key='step'>
          <td>
            Step:
          </td>
          <td id='stepinfo'>
            ${this.step}
          </td>
        </tr>
        <tr key='addmemory'>
          <td>
            Add memory:
          </td>
          <td id='addmemoryinfo'>
            ${this.addmemory}
          </td>
        </tr>
        <tr key='gas'>
          <td>
            Gas:
          </td>
          <td id='gasinfo'>
            ${this.gas}
          </td>
        </tr>
        <tr key='remaininggas'>
          <td>
            Remaining gas:
          </td>
          <td id='remaininggasinfo'>
            ${this.remainingGas}
          </td>
        </tr>
        <tr key='loadedaddress'>
          <td>
            Loaded address:
          </td>
          <td id='loadedaddressinfo'>
            ${this.loadedAddress}
          </td>
        </tr>
      </tbody>
    </table>
  </div>`
  if (!this.view) {
    this.view = view
  }
  return view
}

Sticker.prototype.init = function () {
  var self = this
  this.parent.register('traceUnloaded', this, function () {
    self.hide = true
    yo.update(self.view, self.render())
  })

  this.parent.register('newTraceLoaded', this, function () {
    self.hide = false
    yo.update(self.view, self.render())
  })

  this.parent.register('indexChanged', this, function (index) {
    if (index < 0) return

    self.vmTraceStep = index

    self.traceManager.getCurrentStep(index, function (error, step) {
      if (error) {
        console.log(error)
        self.step = '-'
      } else {
        self.step = step
      }
      yo.update(self.view, self.render())
    })

    self.traceManager.getMemExpand(index, function (error, addmem) {
      if (error) {
        console.log(error)
        self.addmemory = '-'
      } else {
        self.addmemory = addmem
      }
      yo.update(self.view, self.render())
    })

    self.traceManager.getStepCost(index, function (error, gas) {
      if (error) {
        console.log(error)
        self.gas = '-'
      } else {
        self.gas = gas
      }
      yo.update(self.view, self.render())
    })

    self.traceManager.getCurrentCalledAddressAt(index, function (error, address) {
      if (error) {
        console.log(error)
        self.loadedAddress = '-'
      } else {
        self.loadedAddress = address
      }
      yo.update(self.view, self.render())
    })

    self.traceManager.getRemainingGas(index, function (error, remaingas) {
      if (error) {
        console.log(error)
        self.remainingGas = '-'
      } else {
        self.remainingGas = remaingas
      }
      yo.update(self.view, self.render())
    })
  })
}

module.exports = Sticker
