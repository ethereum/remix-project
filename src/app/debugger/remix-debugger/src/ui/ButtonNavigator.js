'use strict'
var remixLib = require('remix-lib')
var EventManager = remixLib.EventManager
var yo = require('yo-yo')

var csjs = require('csjs-inject')
var styleGuide = require('../../../../ui/styles-guide/theme-chooser')
var styles = styleGuide.chooser()

var css = csjs`
  .buttons {
    display: flex;
    flex-wrap: wrap;
  }
  .stepButtons {
    width: 100%;
    display: flex;
    justify-content: center;
  }
  .stepButton {
    ${styles.rightPanel.debuggerTab.button_Debugger}
  }
  .jumpButtons {
    width: 100%;
    display: flex;
    justify-content: center;
  }
  .jumpButton {
    ${styles.rightPanel.debuggerTab.button_Debugger}
  }
  .navigator {
    color: ${styles.rightPanel.debuggerTab.text_Primary};
  }
  .navigator:hover {
    color: ${styles.rightPanel.debuggerTab.button_Debugger_icon_HoverColor};
  }
`

function ButtonNavigator (_parent, _traceManager) {
  this.event = new EventManager()
  this.intoBackDisabled = true
  this.overBackDisabled = true
  this.intoForwardDisabled = true
  this.overForwardDisabled = true
  this.jumpOutDisabled = true
  this.jumpNextBreakpointDisabled = true
  this.jumpPreviousBreakpointDisabled = true

  this.traceManager = _traceManager
  this.currentCall = null
  this.revertionPoint = null

  _parent.event.register('indexChanged', this, (index) => {
    if (!this.view) return
    if (index < 0) return
    if (_parent.currentStepIndex !== index) return

    this.traceManager.buildCallPath(index, (error, callsPath) => {
      if (error) {
        console.log(error)
        resetWarning(this)
      } else {
        this.currentCall = callsPath[callsPath.length - 1]
        if (this.currentCall.reverted) {
          this.revertionPoint = this.currentCall.return
          this.view.querySelector('#reverted').style.display = 'block'
          this.view.querySelector('#reverted #outofgas').style.display = this.currentCall.outOfGas ? 'inline' : 'none'
          this.view.querySelector('#reverted #parenthasthrown').style.display = 'none'
        } else {
          var k = callsPath.length - 2
          while (k >= 0) {
            var parent = callsPath[k]
            if (parent.reverted) {
              this.revertionPoint = parent.return
              this.view.querySelector('#reverted').style.display = 'block'
              this.view.querySelector('#reverted #parenthasthrown').style.display = parent ? 'inline' : 'none'
              this.view.querySelector('#reverted #outofgas').style.display = 'none'
              return
            }
            k--
          }
          resetWarning(this)
        }
      }
    })
  })

  this.view
}

module.exports = ButtonNavigator

ButtonNavigator.prototype.render = function () {
  var self = this
  var view = yo`<div class="${css.buttons}">
    <div class="${css.stepButtons}">
      <button id='overback' title='Step over back' class='${css.navigator} ${css.stepButton} fa fa-reply' onclick=${function () { self.event.trigger('stepOverBack') }} disabled=${this.overBackDisabled} ></button>
      <button id='intoback' title='Step back' class='${css.navigator} ${css.stepButton} fa fa-level-up' onclick=${function () { self.event.trigger('stepIntoBack') }} disabled=${this.intoBackDisabled} ></button>
      <button id='intoforward' title='Step into'  class='${css.navigator} ${css.stepButton} fa fa-level-down' onclick=${function () { self.event.trigger('stepIntoForward') }} disabled=${this.intoForwardDisabled} ></button>
      <button id='overforward' title='Step over forward' class='${css.navigator} ${css.stepButton} fa fa-share' onclick=${function () { self.event.trigger('stepOverForward') }} disabled=${this.overForwardDisabled} ></button>
    </div>

    <div class="${css.jumpButtons}">
      <button id='jumppreviousbreakpoint' title='Jump to the previous breakpoint' class='${css.navigator} ${css.jumpButton} fa fa-step-backward' onclick=${function () { self.event.trigger('jumpPreviousBreakpoint') }} disabled=${this.jumpPreviousBreakpointDisabled} ></button>
      <button id='jumpout' title='Jump out' class='${css.navigator} ${css.jumpButton} fa fa-eject' onclick=${function () { self.event.trigger('jumpOut') }} disabled=${this.jumpOutDisabled} ></button>
      <button id='jumpnextbreakpoint' title='Jump to the next breakpoint' class='${css.navigator} ${css.jumpButton} fa fa-step-forward' onclick=${function () { self.event.trigger('jumpNextBreakpoint') }} disabled=${this.jumpNextBreakpointDisabled} ></button>
    </div>
    <div id='reverted' style="display:none">
      <button id='jumptoexception' title='Jump to exception' class='${css.navigator} ${css.button} fa fa-exclamation-triangle' onclick=${function () { self.event.trigger('jumpToException', [self.revertionPoint]) }} disabled=${this.jumpOutDisabled} >
      </button>
      <span>State changes made during this call will be reverted.</span>
      <span id='outofgas' style="display:none">This call will run out of gas.</span>
      <span id='parenthasthrown' style="display:none">The parent call will throw an exception</span>
    </div>
  </div>`
  if (!this.view) {
    this.view = view
  }
  return view
}

ButtonNavigator.prototype.reset = function () {
  this.intoBackDisabled = true
  this.overBackDisabled = true
  this.intoForwardDisabled = true
  this.overForwardDisabled = true
  this.jumpOutDisabled = true
  this.jumpNextBreakpointDisabled = true
  this.jumpPreviousBreakpointDisabled = true
  resetWarning(this)
}

ButtonNavigator.prototype.stepChanged = function (step) {
  this.intoBackDisabled = step <= 0
  this.overBackDisabled = step <= 0
  if (!this.traceManager) {
    this.intoForwardDisabled = true
    this.overForwardDisabled = true
  } else {
    var self = this
    this.traceManager.getLength(function (error, length) {
      if (error) {
        self.reset()
        console.log(error)
      } else {
        self.jumpNextBreakpointDisabled = step >= length - 1
        self.jumpPreviousBreakpointDisabled = step <= 0
        self.intoForwardDisabled = step >= length - 1
        self.overForwardDisabled = step >= length - 1
        var stepOut = self.traceManager.findStepOut(step)
        self.jumpOutDisabled = stepOut === step
      }
      self.updateAll()
    })
  }
  this.updateAll()
}

ButtonNavigator.prototype.updateAll = function () {
  this.updateDisabled('intoback', this.intoBackDisabled)
  this.updateDisabled('overback', this.overBackDisabled)
  this.updateDisabled('overforward', this.overForwardDisabled)
  this.updateDisabled('intoforward', this.intoForwardDisabled)
  this.updateDisabled('jumpout', this.jumpOutDisabled)
  this.updateDisabled('jumptoexception', this.jumpOutDisabled)
  this.updateDisabled('jumpnextbreakpoint', this.jumpNextBreakpointDisabled)
  this.updateDisabled('jumppreviousbreakpoint', this.jumpPreviousBreakpointDisabled)
}

ButtonNavigator.prototype.updateDisabled = function (id, disabled) {
  if (disabled) {
    document.getElementById(id).setAttribute('disabled', true)
  } else {
    document.getElementById(id).removeAttribute('disabled')
  }
}

function resetWarning (self) {
  self.view.querySelector('#reverted #outofgas').style.display = 'none'
  self.view.querySelector('#reverted #parenthasthrown').style.display = 'none'
  self.view.querySelector('#reverted').style.display = 'none'
}

module.exports = ButtonNavigator
