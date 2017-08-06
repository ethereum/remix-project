var yo = require('yo-yo')
var csjs = require('csjs-inject')
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
    line-height       : 1ch;
    min-height        : 1ch;
    width             : 80ch;
    background-color  : darkblue;
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

var ghostbar = yo`<div class=${css.ghostbar}></div>`

class Terminal {
  constructor (opts = {}) {
    var self = this

    self.data = {
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
    if (opts.shell) self._shell = opts.shell
    // var events = opts.events
    // events.txlistener.register('newBlock', function (block) {
    //   self.log(block)
    // })
    // events.udapp.register('transactionExecuted', function (address, data, lookupOnly, txResult) {
    //   self.log({ address, data, lookupOnly, txResult })
    //   // - trans.sent and info about it once it's mined
    //   // - everything related to the address
    // })
    // ////////
    // make `web3` object available in the console vm
    // web3.object creates contract
    // * create transaction
    // * when transaction is mined
    //   => show all transactions, that are mined and have known addresses
  }
  render () {
    var self = this
    if (self._view.panel) return self._view.panel
    self._view.log = yo`<div class=${css.log}></div>`
    window.INPUT = self._view.input = yo`
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
      <div class=${css.terminal}>
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
    // @TODO: on manual scroll, stop auto-scroll-to-bottom
    // @TODO: while in stopped mode: show indicator about new lines getting logged
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
          // console.log('enter')
          self._view.input.appendChild(document.createElement('br'))
          self.scroll2bottom()
        } else {
          event.preventDefault()
        }
      }
      console.log(event.which, event.keyCode)
      // console.log('----------------')
      // console.log(event.key) // Control
      // console.log('-----')
      // console.log(event.code) // ControlLeft
      // console.log('-----------')
      // console.log('event.altKey ' + event.altKey)
      // console.log('event.ctrlKey ' + event.ctrlKey)
      // console.log('event.metaKey ' + event.metaKey)
      // console.log('event.shiftKey ' + event.shiftKey)
      // console.log(event.location)
      // console.log('event.location')
      // console.log(event.returnValue)
      // console.log('event.returnValue')
      // console.log(event.type)
      // console.log('event.type')
      // console.log('-----')
      // console.log(event)
    }
  }
  log (obj) {
    var self = this
    // var entries = self._serialize(obj)
    // @TODO: convert types to \n string arrays

    var entries = obj.split('\n')
    self.data.session.push(entries)
    var block = yo`
      <div class=${css.block}>
        ${entries.map(str => document.createTextNode(`${str}\n`))}
      </div>
    `
    self._view.log.appendChild(block)
    self.scroll2bottom()
    return entries
  }
  scroll2bottom () {
    var self = this
    setTimeout(function () {
      self._view.term.scrollTop = self._view.term.scrollHeight
    }, 0)
  }
  _serialize (obj) { return JSON.stringify(obj, null, 2) }
  _shell (text) { // default shell
    var self = this
    self.log(text)
    var result = self.evaluate(text)
    self.log(result)
  }
}

module.exports = Terminal
