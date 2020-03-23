'use strict'
var EventManager = require('../../../../lib/events')
var yo = require('yo-yo')

var csjs = require('csjs-inject')

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
  }
  .jumpButtons {
    width: 100%;
    display: flex;
    justify-content: center;
  }
  .jumpButton {
  }
  .navigator {
  }
  .navigator:hover {
  }
`

function ButtonNavigator () {
  this.event = new EventManager()
  this.intoBackDisabled = true
  this.overBackDisabled = true
  this.intoForwardDisabled = true
  this.overForwardDisabled = true
  this.jumpOutDisabled = true
  this.jumpNextBreakpointDisabled = true
  this.jumpPreviousBreakpointDisabled = true

  this.view
}

ButtonNavigator.prototype.render = function () {
  var self = this
  var view = yo`<div class="${css.buttons}">
    <div class="${css.stepButtons} btn-group p-1">
      <button id='overback' class='btn btn-primary btn-sm ${css.navigator} ${css.stepButton} fas fa-reply' title='Step over back' onclick=${function () { self.event.trigger('stepOverBack') }} disabled=${this.overBackDisabled} ></button>
      <button id='intoback' data-id="buttonNavigatorIntoBack" class='btn btn-primary btn-sm ${css.navigator} ${css.stepButton} fas fa-level-up-alt' title='Step back' onclick=${function () { self.event.trigger('stepIntoBack') }} disabled=${this.intoBackDisabled} ></button>
      <button id='intoforward' data-id="buttonNavigatorIntoForward" class='btn btn-primary btn-sm ${css.navigator} ${css.stepButton} fas fa-level-down-alt' title='Step into' onclick=${function () { self.event.trigger('stepIntoForward') }} disabled=${this.intoForwardDisabled} ></button>
      <button id='overforward' class='btn btn-primary btn-sm ${css.navigator} ${css.stepButton} fas fa-share' title='Step over forward'onclick=${function () { self.event.trigger('stepOverForward') }} disabled=${this.overForwardDisabled} ></button>
    </div>

    <div class="${css.jumpButtons} btn-group p-1">
      <button class='btn btn-primary btn-sm ${css.navigator} ${css.jumpButton} fas fa-step-backward'  id='jumppreviousbreakpoint' data-id="buttonNavigatorJumpPreviousBreakpoint" title='Jump to the previous breakpoint' onclick=${function () { self.event.trigger('jumpPreviousBreakpoint') }} disabled=${this.jumpPreviousBreakpointDisabled} ></button>
      <button class='btn btn-primary btn-sm ${css.navigator} ${css.jumpButton} fas fa-eject' id='jumpout' title='Jump out' onclick=${function () { self.event.trigger('jumpOut') }} disabled=${this.jumpOutDisabled} ></button>
      <button class='btn btn-primary btn-sm ${css.navigator} ${css.jumpButton} fas fa-step-forward' id='jumpnextbreakpoint' data-id="buttonNavigatorJumpNextBreakpoint" title='Jump to the next breakpoint' onclick=${function () { self.event.trigger('jumpNextBreakpoint') }} disabled=${this.jumpNextBreakpointDisabled} ></button>
    </div>
    <div id='reverted' style="display:none">
      <button class='btn btn-danger btn-sm' id='jumptoexception' title='Jump to exception' class='${css.navigator} ${css.button} fas fa-exclamation-triangle' onclick=${function () { self.event.trigger('jumpToException') }} disabled=${this.jumpOutDisabled} >
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
  this.resetWarning('')
}

ButtonNavigator.prototype.stepChanged = function (stepState, jumpOutDisabled) {
  if (stepState === 'invalid') {
    // TODO: probably not necessary, already implicit done in the next steps
    this.reset()
    this.updateAll()
    return
  }

  this.intoBackDisabled = (stepState === 'initial')
  this.overBackDisabled = (stepState === 'initial')
  this.jumpPreviousBreakpointDisabled = (stepState === 'initial')
  this.jumpNextBreakpointDisabled = (stepState === 'end')
  this.intoForwardDisabled = (stepState === 'end')
  this.overForwardDisabled = (stepState === 'end')
  this.jumpNextBreakpointDisabled = jumpOutDisabled

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

ButtonNavigator.prototype.resetWarning = function (revertedReason) {
  if (!this.view) return
  this.view.querySelector('#reverted #outofgas').style.display = (revertedReason === 'outofgas') ? 'inline' : 'none'
  this.view.querySelector('#reverted #parenthasthrown').style.display = (revertedReason === 'parenthasthrown') ? 'inline' : 'none'
  this.view.querySelector('#reverted').style.display = (revertedReason === '') ? 'none' : 'block'
}

module.exports = ButtonNavigator
