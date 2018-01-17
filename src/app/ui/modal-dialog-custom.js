var modal = require('./modaldialog.js')
var yo = require('yo-yo')
var csjs = require('csjs-inject')

var css = csjs`
  .prompt_text {
    width: 300px;
  }
`
module.exports = {
  alert: function (text) {
    modal('', yo`<div>${text}</div>`, null, { label: null })
  },
  prompt: function (title, text, inputValue, ok, cancel) {
    prompt(title, text, false, inputValue, ok, cancel)
  },
  promptPassphrase: function (title, text, inputValue, ok, cancel) {
    prompt(title, text, true, inputValue, ok, cancel)
  },
  promptMulti: function ({ title, text, inputValue }, ok, cancel) {
    if (!inputValue) inputValue = ''
    var input = yo`<textarea id="prompt_text" class=${css.prompt_text} rows="4" cols="50"></textarea>`
    modal(title, yo`<div>${text}<div>${input}</div></div>`,
      {
        fn: () => { if (typeof ok === 'function') ok(document.getElementById('prompt_text').value) }
      },
      {
        fn: () => { if (typeof cancel === 'function') cancel() }
      }
    )
  },
  confirm: function (title, text, ok, cancel) {
    modal(title, yo`<div>${text}</div>`,
      {
        fn: () => { if (typeof ok === 'function') ok() }
      },
      {
        fn: () => { if (typeof cancel === 'function') cancel() }
      }
    )
  }
}

function prompt (title, text, hidden, inputValue, ok, cancel) {
  if (!inputValue) inputValue = ''
  var type = hidden ? 'password' : 'text'
  var input = yo`<input type=${type} name='prompt_text' id='prompt_text' class="${css['prompt_text']}" value='${inputValue}' >`
  modal(title, yo`<div>${text}<div>${input}</div></div>`,
    {
      fn: () => { if (typeof ok === 'function') ok(document.getElementById('prompt_text').value) }
    },
    {
      fn: () => { if (typeof cancel === 'function') cancel() }
    }
  )
}
