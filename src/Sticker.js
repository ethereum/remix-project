'use strict'
var yo = require('yo-yo')

function Sticker (_parent, _traceManager) {
  this.parent = _parent
  this.traceManager = _traceManager

  this.vmTraceStep
  this.step
  this.addmemory
  this.gas
  this.remainingGas

  this.view
  this.init()
}

Sticker.prototype.render = function () {
  var view = yo`<div>
    <table>
      <tbody>
        <tr key='vmtracestep'>
          <td>
            vmtracestep
          </td>
          <td>
            ${this.vmTraceStep}
          </td>
        </tr>
        <tr key='step'>
          <td>
            step
          </td>
          <td>
            ${this.step}
          </td>
        </tr>
        <tr key='addmemory'>
          <td>
            add memory
          </td>
          <td>
            ${this.addmemory}
          </td>
        </tr>
        <tr key='gas'>
          <td>
            gas
          </td>
          <td>
            ${this.gas}
          </td>
        </tr>
        <tr key='remaininggas'>
          <td>
            remaining gas
          </td>
          <td>
            ${this.remainingGas}
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
  this.parent.register('indexChanged', this, function (index) {
    if (index < 0) return

    self.vmTraceStep = index

    self.traceManager.getCurrentStep(index, function (error, step) {
      if (error) {
        console.log(error)
      } else {
        self.step = step
        yo.update(self.view, self.render())
      }
    })

    self.traceManager.getMemExpand(index, function (error, addmem) {
      if (error) {
        console.log(error)
      } else {
        self.addmemory = addmem
        yo.update(self.view, self.render())
      }
    })

    self.traceManager.getStepCost(index, function (error, gas) {
      if (error) {
        console.log(error)
      } else {
        self.gas = gas
        yo.update(self.view, self.render())
      }
    })

    self.traceManager.getRemainingGas(index, function (error, remaingas) {
      if (error) {
        console.log(error)
      } else {
        self.remainingGas = remaingas
        yo.update(self.view, self.render())
      }
    })
  })
}

module.exports = Sticker
