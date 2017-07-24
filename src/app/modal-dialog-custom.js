var modal = require('./modaldialog.js')
var yo = require('yo-yo')
module.exports = {
  alert: function (text) {
    modal('', yo`<div>${text}</div>`, null, null)
    var cancel = document.getElementById('modal-footer-cancel')
      cancel.style.display = 'none'
  }
}
