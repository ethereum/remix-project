var $ = require('jquery');

function FormalVerification (outputElement, renderer) {
  this.outputElement = outputElement;
  this.renderer = renderer;
}

FormalVerification.prototype.compiling = function () {
  $('#formalVerificationInput', this.outputElement).val('');
  $('#formalVerificationErrors').empty();
};

FormalVerification.prototype.compilationFinished = function (compilationResult) {
  if (compilationResult.formal !== undefined) {
    if (compilationResult.formal['why3'] !== undefined) {
      $('#formalVerificationInput', this.outputElement).val(
        '(* copy this to http://why3.lri.fr/try/ *)' +
        compilationResult.formal['why3']
      );
    }
    if (compilationResult.formal.errors !== undefined) {
      var errors = compilationResult.formal.errors;
      for (var i = 0; i < errors.length; i++) {
        this.renderer.error(errors[i], $('#formalVerificationErrors'), true);
      }
    }
  }
};

module.exports = FormalVerification;
