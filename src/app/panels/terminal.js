/* global Node */
var yo = require('yo-yo')
var csjs = require('csjs-inject')
var javascriptserialize = require('javascript-serialize')
var jsbeautify = require('js-beautify')
var type = require('component-type')
var EventManager = require('ethereum-remix').lib.EventManager

var css = csjs`
  .panel              {
    position          : relative;
    display           : flex;
    flex-direction    : column;
    font-size         : 12px;
    font-family       : monospace;
    color             : white;
    background-color  : black;
    margin-top        : auto;
    height            : 100%;
    min-height        : 1.7em;
  }

  .bar                {
    display           : flex;
    justify-content   : flex-end;
    min-height        : 1.7em;
    padding           : 2px;
    cursor            : ns-resize;
    background-color  : #eef;
  }
  .minimize           {
    text-align        : center;
    padding-top       : 3px;
    width             : 10px;
    min-height        : 100%;
    cursor            : pointer;
    color             : black;
  }
  .hover              {
    color             : orange;
  }

  .terminal           {
    display           : flex;
    flex-direction    : column;
    height            : 100%;
    padding-left      : 5px;
    padding-right     : 5px;
    padding-bottom    : 3px;
    overflow-y        : auto;
    font-family       : monospace;
  }

  .log                {
    margin-top        : auto;
    font-family       : monospace;
  }
  .block              {
    word-break        : break-all;
    white-space       : pre-wrap;
    line-height       : 2ch;
    width             : 80ch;
    background-color  : black;
    margin            : 1ch;
  }

  .cli                {
    line-height       : 1.7em;
    font-family       : monospace;
  }
  .prompt             {
    margin-right      : 0.5em;
    font-family       : monospace;
  }
  .input              {
    word-break        : break-all;
    outline           : none;
    font-family       : monospace;
  }
  .error              {
    color             : red;
  }
  .info               {
    color             : blue;
  }
  .default            {
    color             : white;
  }
  .ghostbar           {
    position          : absolute;
    height            : 6px;
    background-color  : #C6CFF7;
    opacity           : 0.5;
    cursor            : row-resize;
    z-index           : 9999;
    left              : 0;
    right             : 0;
  }
`

var currentError

window.addEventListener('error', function (event) {
  currentError = new Error(event.message)
  currentError.timeStamp = event.timeStamp
  currentError.isTrusted = event.isTrusted
  currentError.filename = event.filename
  currentError.lineno = event.lineno
  currentError.colno = event.colno
  currentError.error = event.error
  currentError.type = event.type
})

window.onerror = function (msg, url, lineno, col, error) {
  if (!error) error = currentError
  var val = { msg: msg, url: url, lineno: lineno, col: col, error: error }
  console.error(val)
}

var KONSOLES = []
// var KONSOLES = [{
//   error: console.error.bind(console),
//   info: console.info.bind(console),
//   log: console.log.bind(console)
// }]
// console.error = broadcast('error')
// console.info = broadcast('info')
// console.log = broadcast('log')
//
// function broadcast (mode) {
//   return function broadcastMode () {
//     var args = arguments
//     KONSOLES.forEach(function (api) { api[mode].apply(api, args) })
//   }
// }

function register (api) { KONSOLES.push(api) }

var ghostbar = yo`<div class=${css.ghostbar}></div>`

class Terminal {
  constructor (opts = { auto: true }) {
    var self = this
    self.data = {
      lineLength: opts.lineLength || 80,
      session: [],
      banner: opts.banner || `
/******************************************************************************
                                              
  ...........................................
  .....................:.....................
  ....................o:;....................
  ...................oo:;;...................
  ..................ooo:;;;..................
  .................oooo:;;;;.................
  ................ooooo:;;;;;................
  ...............oooooo:;;;;;;...............
  ..............ooooooo:;;;;;;;..............
  .............ooooooo;:';;;;;;;.............
  ............ooooo;;;;:'''';;;;;............
  ...........oo;;;;;;;;:'''''''';;...........
  ..........;;;;;;;;;;;:'''''''''''..........
  ..............;;;;;;;:'''''''..............
  ...........oo...;;;;;:'''''...;;...........
  ............oooo...;;:''...;;;;............
  ..............oooo...:...;;;;..............
  ...............oooooo:;;;;;;...............
  ................ooooo:;;;;;................
  .................oooo:;;;;.................
  ..................ooo:;;;..................
  ...................oo:;;...................
  ....................o:;....................
  .....................:.....................
  ...........................................
                                              
                                              
  ########  ######## ##     ## #### ##     ## 
  ##     ## ##       ###   ###  ##   ##   ##  
  ##     ## ##       #### ####  ##    ## ##   
  ########  ######   ## ### ##  ##     ###    
  ##   ##   ##       ##     ##  ##    ## ##   
  ##    ##  ##       ##     ##  ##   ##   ##  
  ##     ## ######## ##     ## #### ##     ## 
                                              
                                              
  welcome to browser solidity
                                              
  new features:
    - dom terminal v0.0.1-alpha
                                              
******************************************************************************/
`
    }
    self.event = new EventManager()
    self._api = opts.api
    self._view = { panel: null, bar: null, input: null, term: null, log: null, cli: null }
    self._templates = {}
    self._templates.default = self._blocksRenderer('default')
    self._templates.error = self._blocksRenderer('error')
    self._templates.info = self._blocksRenderer('info')
    if (opts.shell) self._shell = opts.shell
    // @TODO: listen to all relevant events
    // var events = opts.events
    // events.txlistener.register('newBlock', function (block) {
    //   self.log(block)
    // })
    // events.udapp.register('transactionExecuted', function (address, data, lookupOnly, txResult) {
    //   self.log({ address, data, lookupOnly, txResult })
    //   // - trans.sent and info about it once it's mined
    //   // - everything related to the address
    // })
    register(self)
  }
  render () {
    var self = this
    if (self._view.panel) return self._view.panel
    self._view.log = yo`<div class=${css.log}></div>`
    self._view.input = yo`
      <span class=${css.input} contenteditable="true" onkeydown=${change}></span>
    `
    self._view.cli = yo`
      <div class=${css.cli} onclick=${e => self._view.input.focus()}>
        <span class=${css.prompt}>${'>'}</span>
        ${self._view.input}
      </div>
    `
    self._view.icon = yo`<i onmouseenter=${hover} onmouseleave=${hover} onmousedown=${minimize} class="${css.minimize} fa fa-angle-double-down"></i>`
    self._view.bar = yo`
      <div class=${css.bar} onmousedown=${mousedown}>
        ${self._view.icon}
      </div>
    `
    self._view.term = yo`
      <div class=${css.terminal} onscroll=${reattach}>
        ${self._view.log}
        ${self._view.cli}
      </div>
    `
    self._view.panel = yo`
      <div class=${css.panel}>
        ${self._view.bar}
        ${self._view.term}
      </div>
    `
    self.log(self.data.banner)

    function reattach (event) {
      var el = event.currentTarget
      var isBottomed = el.scrollHeight - el.scrollTop === el.clientHeight
      if (isBottomed) {
        delete self.scroll2bottom
        // @TODO: delete new message indicator
      } else {
        self.scroll2bottom = function () { }
        // @TODO: while in stopped mode: show indicator about new lines getting logged
      }
    }
    function hover (event) { event.currentTarget.classList.toggle(css.hover) }
    function minimize (event) {
      event.preventDefault()
      event.stopPropagation()
      var classList = self._view.icon.classList
      classList.toggle('fa-angle-double-down')
      classList.toggle('fa-angle-double-up')
      self.event.trigger('resize', [])
    }
    // ----------------- resizeable ui ---------------
    function mousedown (event) {
      event.preventDefault()
      if (event.which === 1) {
        moveGhostbar(event)
        document.body.appendChild(ghostbar)
        document.addEventListener('mousemove', moveGhostbar)
        document.addEventListener('mouseup', removeGhostbar)
        document.addEventListener('keydown', cancelGhostbar)
      }
    }
    function cancelGhostbar (event) {
      if (event.keyCode === 27) {
        document.body.removeChild(ghostbar)
        document.removeEventListener('mousemove', moveGhostbar)
        document.removeEventListener('mouseup', removeGhostbar)
        document.removeEventListener('keydown', cancelGhostbar)
      }
    }
    function moveGhostbar (event) { // @NOTE HORIZONTAL ghostbar
      ghostbar.style.top = self._api.getPosition(event) + 'px'
    }
    function removeGhostbar (event) {
      if (self._view.icon.classList.contains('fa-angle-double-up')) {
        self._view.icon.classList.toggle('fa-angle-double-down')
        self._view.icon.classList.toggle('fa-angle-double-up')
      }
      document.body.removeChild(ghostbar)
      document.removeEventListener('mousemove', moveGhostbar)
      document.removeEventListener('mouseup', removeGhostbar)
      document.removeEventListener('keydown', cancelGhostbar)
      self.event.trigger('resize', [self._api.getPosition(event)])
    }

    return self._view.panel

    function change (event) {
      if (event.which === 13) {
        if (event.ctrlKey) { // <ctrl+enter>
          self._view.input.appendChild(document.createElement('br'))
          self.scroll2bottom()
          putCursor2End(self._view.input)
        } else { // <enter>
          event.preventDefault()
          self.execute(self._view.input.innerText)
          self._view.input.innerHTML = ''
        }
      }
    }
    function putCursor2End (editable) {
      var range = document.createRange()
      range.selectNode(editable)
      var child = editable
      var chars

      while (child) {
        if (child.lastChild) child = child.lastChild
        else break
        if (child.nodeType === Node.TEXT_NODE) {
          chars = child.textContent.length
        } else {
          chars = child.innerHTML.length
        }
      }

      range.setEnd(child, chars)
      var toStart = true
      var toEnd = !toStart
      range.collapse(toEnd)

      var sel = window.getSelection()
      sel.removeAllRanges()
      sel.addRange(range)

      editable.focus()
    }
  }
  _blocksRenderer (mode) {
    var self = this
    var modes = { log: true, info: true, error: true, default: true }
    if (modes[mode]) {
      return function render () {
        var args = [].slice.call(arguments)
        var types = args.map(type)
        var values = javascriptserialize.apply(null, args).map(function (val, idx) {
          if (types[idx] === 'element') val = jsbeautify.html(val)
          var pattern = '.{1,' + self.data.lineLength + '}'
          var lines = val.match(new RegExp(pattern, 'g'))
          return lines.map(str => document.createTextNode(`${str}\n`))
        })
        return values
      }
    } else {
      throw new Error('mode is not supported')
    }
  }
  registerType (typename, template) {
    var self = this
    if (typeof template !== 'function') throw new Error('invalid template')
    self._template[typename] = template
  }
  log () {
    var self = this
    var args = [...arguments]
    self.data.session.push(args)
    args.forEach(function (data = {}) {
      if (!data.type) data = { type: 'default', value: data }
      var render = self._templates[data.type]
      if (!render) render = self._templates.default
      var blocks = render(data.value)
      blocks.forEach(function (block) {
        self._view.log.appendChild(yo`
          <div class="${css.block} ${css[data.type] || data.type}">
            ${block}
          </div>
        `)
        self.scroll2bottom()
      })
    })
  }
  scroll2bottom () {
    var self = this
    setTimeout(function () {
      self._view.term.scrollTop = self._view.term.scrollHeight
    }, 0)
  }
  execute (input) {
    var self = this
    input = String(input)
    self.log(`> ${input}`)
    self._shell(input, function (error, output) {
      if (error) {
        self.error(error)
        return error
      } else {
        self.log(output)
        return output
      }
    })
  }
  _shell (input, done) { // default shell
    // @TODO: add environment and proxy console.log to self.log
    // make `web3` object available in the console vm
    // web3.object creates contract
    // * create transaction
    // * when transaction is mined
    //   => show all transactions, that are mined and have known addresses
    try {
      var result = eval(input) // eslint-disable-line
      done(null, result)
    } catch (error) {
      done(error.message)
    }
  }
}

module.exports = Terminal
