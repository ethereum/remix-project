'use strict'

var $ = require('jquery')
var EventManager = require('../lib/eventManager')

/*
  trigger compilationFinished
*/
function FormalVerification (outputElement, compilerEvent) {
  this.event = new EventManager()
  this.outputElement = outputElement
  var self = this
  compilerEvent.register('compilationFinished', this, function (success, data, source) {
    if (success) {
      self.compilationFinished(data)
    }
  })
  compilerEvent.register('compilationStarted', this, function () {
    $('#formalVerificationInput', self.outputElement)
      .val('')
      .hide()
    $('#formalVerificationErrors').empty()
  })
}

FormalVerification.prototype.compilationFinished = function (compilationResult) {
  if (compilationResult.formal === undefined) {
    this.event.trigger(
      'compilationFinished',
      [false, 'Formal verification not supported by this compiler version.', $('#formalVerificationErrors'), {noAnnotations: true}]
    )
  } else {
    if (compilationResult.formal['why3'] !== undefined) {
      $('#formalVerificationInput', this.outputElement).val(
        '(* copy this to http://why3.lri.fr/try/ *)' +
        compilationResult.formal['why3']
      )
        .show()
    }
    if (compilationResult.formal.errors !== undefined) {
      var errors = compilationResult.formal.errors
      for (var i = 0; i < errors.length; i++) {
        this.event.trigger('compilationFinished', [false, errors[i], $('#formalVerificationErrors'), {noAnnotations: true}])
      }
    } else {
      this.event.trigger('compilationFinished', [true, null, null, {noAnnotations: true}])
    }
  }
}

module.exports = FormalVerification
