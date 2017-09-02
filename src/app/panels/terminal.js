/* global Node */
var yo = require('yo-yo')
var csjs = require('csjs-inject')
var javascriptserialize = require('javascript-serialize')
var jsbeautify = require('js-beautify')
var type = require('component-type')
var vm = require('vm')
var EventManager = require('ethereum-remix').lib.EventManager
var Web3 = require('web3')

var executionContext = require('../../execution-context')
var Dropdown = require('../ui/dropdown')

var css = csjs`
  .panel              {
    position          : relative;
    display           : flex;
    flex-direction    : column;
    font-size         : 12px;
    font-family       : monospace;
    color             : black;
    background-color  : lightgrey;
    margin-top        : auto;
    height            : 100%;
    min-height        : 1.7em;
    overflow          : hidden;
  }

  .bar                {
    display           : flex;
    min-height        : 1.7em;
    padding           : 2px;
    background-color  : #eef;
    z-index           : 3;
  }
  .menu               {
    position          : relative;
    display           : flex;
    align-items       : center;
    width             : 100%;
  }
  .title              {
    margin-right      : 15px;
  }
  .minimize           {
    margin-left       : auto;
    width             : 10px;
    cursor            : pointer;
    color             : black;
  }
  .clear              {
    margin-right      : 5px;
    font-size         : 15px;
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
  .journal            {
    margin-top        : auto;
    font-family       : monospace;
  }
  .block              {
    word-break        : break-all;
    white-space       : pre-wrap;
    line-height       : 2ch;
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

  .dragbarHorizontal  {
    position          : absolute;
    top               : 0;
    height            : 0.5em;
    right             : 0;
    left              : 0;
    cursor            : ns-resize;
    z-index           : 999;
    border-top        : 2px solid hsla(215, 81%, 79%, .3);
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

var KONSOLES = []

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
    self._components = {}
    self._components.dropdown = new Dropdown({
      options: [
        'knownTransaction',
        'unknownTransaction',
        'script'
      ],
      defaults: ['knownTransaction', 'script']
    })
    self._components.dropdown.event.register('deselect', function (label) {
      console.log('deselect', label)
    })
    self._components.dropdown.event.register('select', function (label) {
      console.log('select', label)
    })
    self._view = { el: null, bar: null, input: null, term: null, journal: null, cli: null }
    self._commands = {}
    self.commands = {}
    self._INDEX = {}
    self._INDEX.all = []
    self._INDEX.allMain = []
    self._INDEX.commands = {}
    self._INDEX.commandsMain = {}
    self.registerCommand('log', self._blocksRenderer('log'))
    self.registerCommand('info', self._blocksRenderer('info'))
    self.registerCommand('error', self._blocksRenderer('error'))
    self.registerCommand('script', function execute (args, scopedCommands, append) {
      var script = String(args[0])
      scopedCommands.log(`> ${script}`)
      self._shell(script, function (error, output) {
        if (error) scopedCommands.error(error)
        else scopedCommands.log(output)
      })
    })
    self._jsSandboxContext = {}
    self._jsSandbox = vm.createContext(self._jsSandboxContext)
    if (opts.shell) self._shell = opts.shell
    register(self)
  }
  render () {
    var self = this
    if (self._view.el) return self._view.el
    self._view.journal = yo`<div class=${css.journal}></div>`
    self._view.input = yo`
      <span class=${css.input} contenteditable="true" onkeydown=${change}></span>
    `
    self._view.cli = yo`
      <div class=${css.cli}>
        <span class=${css.prompt}>${'>'}</span>
        ${self._view.input}
      </div>
    `
    self._view.icon = yo`<i onmouseenter=${hover} onmouseleave=${hover} onmousedown=${minimize} class="${css.minimize} fa fa-angle-double-down"></i>`
    self._view.dragbar = yo`<div onmousedown=${mousedown} class=${css.dragbarHorizontal}></div>`
    self._view.dropdown = self._components.dropdown.render()
    self._view.bar = yo`
      <div class=${css.bar}>
        ${self._view.dragbar}
        <div class=${css.menu}>
          <div class=${css.title}>Remix Terminal</div>
          <div class=${css.clear} onclick=${clear}>
            <i class="fa fa-ban" aria-hidden="true" onmouseenter=${hover} onmouseleave=${hover}></i>
          </div>
          ${self._view.dropdown}
          <input type="text" class=${css.filter} onkeypress=${filter}></div>
          ${self._view.icon}
        </div>
      </div>
    `
    self._view.term = yo`
      <div class=${css.terminal} onscroll=${throttle(reattach, 10)} onclick=${focusinput}>
        ${self._view.journal}
        ${self._view.cli}
      </div>
    `
    self._view.el = yo`
      <div class=${css.panel}>
        ${self._view.bar}
        ${self._view.term}
      </div>
    `
    self.commands.log(self.data.banner)

    function throttle (fn, wait) {
      var time = Date.now()
      return function debounce () {
        if ((time + wait - Date.now()) < 0) {
          fn.apply(this, arguments)
          time = Date.now()
        }
      }
    }
    var css2 = csjs`
      .anchor            {
        position         : static;
        border-top       : 2px dotted blue;
        height           : 10px;
      }
      .overlay           {
        position         : absolute;
        width            : 100%;
        display          : flex;
        align-items      : center;
        justify-content  : center;
        bottom           : 0;
        right            : 15px;
        height           : 20%;
        min-height       : 50px;
      }
      .text              {
        z-index          : 2;
        color            : black;
        font-size        : 25px;
        font-weight      : bold;
        pointer-events   : none;
      }
      .background        {
        z-index          : 1;
        opacity          : 0.8;
        background-color : #a6aeba;
        cursor           : pointer;
      }
    `
    var text = yo`<div class="${css2.overlay} ${css2.text}"></div>`
    var background = yo`<div class="${css2.overlay} ${css2.background}"></div>`
    var placeholder = yo`<div class=${css2.anchor}>${background}${text}</div>`
    var inserted = false

    function focusinput (event) {
      if (self._view.journal.offsetHeight - (self._view.term.scrollTop + self._view.term.offsetHeight) < 50) {
        refocus()
      }
    }
    function refocus () {
      self._view.input.focus()
      reattach({ currentTarget: self._view.term })
      delete self.scroll2bottom
      self.scroll2bottom()
    }
    function reattach (event) {
      var el = event.currentTarget
      var isBottomed = el.scrollHeight - el.scrollTop - el.clientHeight < 30
      if (isBottomed) {
        if (inserted) {
          text.innerText = ''
          background.onclick = undefined
          self._view.journal.removeChild(placeholder)
        }
        inserted = false
        delete self.scroll2bottom
      } else {
        if (!inserted) self._view.journal.appendChild(placeholder)
        inserted = true
        check()
        if (!placeholder.nextElementSibling) {
          placeholder.style.display = 'none'
        } else {
          placeholder.style = ''
        }
        self.scroll2bottom = function () {
          var next = placeholder.nextElementSibling
          if (next) {
            placeholder.style = ''
            check()
            var messages = 1
            while ((next = next.nextElementSibling)) messages += 1
            text.innerText = `${messages} new unread log entries`
          } else {
            placeholder.style.display = 'none'
          }
        }
      }
    }
    function check () {
      var pos1 = self._view.term.offsetHeight + self._view.term.scrollTop - (self._view.el.offsetHeight * 0.15)
      var pos2 = placeholder.offsetTop
      if ((pos1 - pos2) > 0) {
        text.style.display = 'none'
        background.style.position = 'relative'
        background.style.opacity = 0.3
        background.style.right = 0
        background.style.borderBox = 'content-box'
        background.style.padding = '2px'
        background.style.height = (self._view.journal.offsetHeight - (placeholder.offsetTop + placeholder.offsetHeight)) + 'px'
        background.onclick = undefined
        background.style.cursor = 'default'
      } else {
        background.style = ''
        text.style = ''
        background.onclick = function (event) {
          console.error('background click')
          placeholder.scrollIntoView()
          check()
        }
      }
    }
    function hover (event) { event.currentTarget.classList.toggle(css.hover) }
    function minimize (event) {
      event.preventDefault()
      event.stopPropagation()
      if (event.button === 0) {
        var classList = self._view.icon.classList
        classList.toggle('fa-angle-double-down')
        classList.toggle('fa-angle-double-up')
        self.event.trigger('resize', [])
      }
    }
    function filter (event) {
      var input = event.currentTarget
      setTimeout(function () {
        console.log('filter', input.value)
      }, 0)
    }
    function clear (event) {
      refocus()
      self._view.journal.innerHTML = ''
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

    return self._view.el

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
  scroll2bottom () {
    var self = this
    setTimeout(function () {
      self._view.term.scrollTop = self._view.term.scrollHeight
    }, 0)
  }
  _blocksRenderer (mode) {
    var self = this
    mode = { log: 'black', info: 'blue', error: 'red' }[mode] // defaults
    if (mode) {
      return function logger (args, scopedCommands, append) {
        var types = args.map(type)
        var values = javascriptserialize.apply(null, args).map(function (val, idx) {
          if (typeof args[idx] === 'string') val = args[idx]
          if (types[idx] === 'element') val = jsbeautify.html(val)
          var pattern = '.{1,' + self.data.lineLength + '}'
          var lines = val.match(new RegExp(pattern, 'g'))
          return lines.map(str => document.createTextNode(`${str}\n`))
        })
        append(yo`<span style="color: ${mode};">${values}</span>`)
      }
    } else {
      throw new Error('mode is not supported')
    }
  }
  _scopeCommands (append) {
    var self = this
    var scopedCommands = {}
    Object.keys(self.commands).forEach(function makeScopedCommand (cmd) {
      var command = self._commands[cmd]
      scopedCommands[cmd] = function _command () {
        var args = arguments
        command(args, scopedCommands, el => append(cmd, args, el))
      }
    })
    return scopedCommands
  }
  registerCommand (name, command) {
    var self = this
    name = String(name)
    if (self._commands[name]) throw new Error(`command "${name}" exists already`)
    if (typeof command !== 'function') throw new Error(`invalid command: ${command}`)
    self._commands[name] = command
    self._INDEX.commands[name] = []
    self._INDEX.commandsMain[name] = []
    self.commands[name] = function _command () {
      var args = [...arguments]
      var steps = []
      var root = { steps, cmd: name }
      var ITEM = { root, cmd: name }
      root.gidx = self._INDEX.allMain.push(ITEM) - 1
      root.idx = self._INDEX.commandsMain[name].push(ITEM) - 1
      function append (cmd, params, el) {
        var item
        if (cmd) { // subcommand
          item = { el, cmd, root }
        } else { // command
          item = ITEM
          item.el = el
          cmd = name
        }
        item.gidx = self._INDEX.all.push(item) - 1
        item.idx = self._INDEX.commands[cmd].push(item) - 1
        item.step = steps.push(item) - 1
        item.args = params
        self._view.journal.appendChild(yo`
          <div data-gidx=${item.gidx} class=${css.block}>${el}</div>
        `)
        self.scroll2bottom()
      }
      var scopedCommands = self._scopeCommands(append)
      command(args, scopedCommands, el => append(null, args, el))
    }
    var help = typeof command.help === 'string' ? command.help : [
      `// no help available for:`,
      `terminal.commands.${name}(...)`
    ].join('\n')
    self.commands[name].toString = _ => { return help }
    self.commands[name].help = help
    return self.commands[name]
  }
  _shell (script, done) { // default shell
    var self = this
    try {
      var context = vm.createContext(Object.assign(self._jsSandboxContext, domTerminalFeatures(self)))
      var result = vm.runInContext(script, context)
      self._jsSandboxContext = Object.assign({}, context)
      done(null, result)
    } catch (error) {
      done(error.message)
    }
  }
}

function domTerminalFeatures (self) {
  // @TODO add all the `console` functions
  return {
    web3: executionContext.getProvider() !== 'vm' ? new Web3(executionContext.web3().currentProvider) : null,
    console: {
      log: function () { self.commands.log.apply(null, arguments) },
      info: function () { self.commands.info.apply(null, arguments) },
      error: function () { self.commands.error.apply(null, arguments) }
    }
  }
}

module.exports = Terminal
