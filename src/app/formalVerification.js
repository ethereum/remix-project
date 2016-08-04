var $ = require('jquery');
var util = require('../lib/util');

/*
  trigger compilationError
*/
function FormalVerification (outputElement) {
  util.makeEventCapable(this);
  this.outputElement = outputElement;
}

FormalVerification.prototype.compiling = function () {
  $('#formalVerificationInput', this.outputElement)
    .val('')
    .hide();
  $('#formalVerificationErrors').empty();
};

FormalVerification.prototype.compilationFinished = function (compilationResult) {
  if (compilationResult.formal === undefined) {
    this.event.trigger('compilationError', ['Formal verification not supported by this compiler version.', $('#formalVerificationErrors'), true]);
  } else {
    if (compilationResult.formal['why3'] !== undefined) {
      $('#formalVerificationInput', this.outputElement).val(
        '(* copy this to http://why3.lri.fr/try/ *)' +
        compilationResult.formal['why3']
      )
        .show();
    }
    if (compilationResult.formal.errors !== undefined) {
      var errors = compilationResult.formal.errors;
      for (var i = 0; i < errors.length; i++) {
        this.event.trigger('compilationError', [errors[i], $('#formalVerificationErrors'), true]);
      }
    }
  }
};

module.exports = FormalVerification;
