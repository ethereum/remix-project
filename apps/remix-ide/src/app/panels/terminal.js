/* global Node, requestAnimationFrame */   // eslint-disable-line
import React from 'react' // eslint-disable-line
import ReactDOM from 'react-dom'
import { RemixUiTerminal } from '@remix-ui/terminal' // eslint-disable-line
import { Plugin } from '@remixproject/engine'
import * as packageJson from '../../../../../package.json'
import * as remixBleach from '../../lib/remixBleach'

var yo = require('yo-yo')
var javascriptserialize = require('javascript-serialize')
var jsbeautify = require('js-beautify')
var type = require('component-type')
var vm = require('vm')
var EventManager = require('../../lib/events')

var CommandInterpreterAPI = require('../../lib/cmdInterpreterAPI')
var AutoCompletePopup = require('../ui/auto-complete-popup')

var css = require('./styles/terminal-styles')

import { CompilerImports } from '@remix-project/core-plugin' // eslint-disable-line
var globalRegistry = require('../../global/registry')
var SourceHighlighter = require('../../app/editor/sourceHighlighter')
var GistHandler = require('../../lib/gist-handler')

var KONSOLES = []

function register (api) { KONSOLES.push(api) }

const profile = {
  displayName: 'Terminal',
  name: 'terminal',
  methods: ['log'],
  events: [],
  description: ' - ',
  version: packageJson.version
}

class Terminal extends Plugin {
  constructor (opts, api, config, registry) {
    super(profile)
    this.fileImport = new CompilerImports()
    this.gistHandler = new GistHandler()
    this.event = new EventManager()
    this.registry = registry
    this.globalRegistry = globalRegistry
    this.element = document.createElement('div')
    this.element.setAttribute('class', 'panel_2A0YE0')
    this.element.setAttribute('id', 'terminal-view')
    this.eventsDecoder = this.globalRegistry.get('eventsDecoder').api
    this.txListener = this.globalRegistry.get('txlistener').api
    this.sourceHighlighter = new SourceHighlighter()
    this._deps = {
      fileManager: this.registry.get('filemanager').api,
      editor: this.registry.get('editor').api,
      compilersArtefacts: this.registry.get('compilersartefacts').api,
      offsetToLineColumnConverter: this.registry.get('offsettolinecolumnconverter').api
    }
    this.commandHelp = {
      'remix.loadgist(id)': 'Load a gist in the file explorer.',
      'remix.loadurl(url)': 'Load the given url in the file explorer. The url can be of type github, swarm, ipfs or raw http',
      'remix.execute(filepath)': 'Run the script specified by file path. If filepath is empty, script currently displayed in the editor is executed.',
      'remix.exeCurrent()': 'Run the script currently displayed in the editor',
      'remix.help()': 'Display this help message'
    }
    this.blockchain = opts.blockchain
    this.vm = vm
    this._api = api
    this._opts = opts
    this.config = config
    this.version = packageJson.version
    this.data = {
      lineLength: opts.lineLength || 80, // ????
      session: [],
      activeFilters: { commands: {}, input: '' },
      filterFns: {}
    }
    this._view = { el: null, bar: null, input: null, term: null, journal: null, cli: null }
    this._components = {}
    this._components.cmdInterpreter = new CommandInterpreterAPI(this, null, this.blockchain)
    this._components.autoCompletePopup = new AutoCompletePopup(this._opts)
    // this._components.autoCompletePopup.event.register('handleSelect', function (input) {
    //   const textList = this._view.input.innerText.split(' ')
    //   textList.pop()
    //   textList.push(input)
    //   this._view.input.innerText = textList
    //   this._view.input.focus()
    //   this.putCursor2End(this._view.input)
    // })
    this._commands = {}
    this.commands = {}
    this._JOURNAL = []
    this._jobs = []
    this._INDEX = {}
    this._INDEX.all = []
    this._INDEX.allMain = []
    this._INDEX.commands = {}
    this._INDEX.commandsMain = {}
    if (opts.shell) this._shell = opts.shell // ???
    register(this)
  }

  onActivation () {
    this.renderComponent()
  }

  onDeactivation () {
    this.off('scriptRunner', 'log')
    this.off('scriptRunner', 'info')
    this.off('scriptRunner', 'warn')
    this.off('scriptRunner', 'error')
  }

  // logHtml (html) {
  //   var command = this.commands.html
  //   if (typeof command === 'function') command(html)
  // }

  logHtml (html) {
    var command = this.commands.html
    if (typeof command === 'function') command(html)
  }

  render () {
    return this.element
  }

  renderComponent () {
    ReactDOM.render(
      <RemixUiTerminal
        event = {this.event}
        autoCompletePopupEvent = {this._components.autoCompletePopup.event}
        blockchain = {this.blockchain}
        api = {this._api}
        options = {this._opts}
        data = {this.data}
        cmdInterpreter = {this._components.cmdInterpreter}
        autoCompletePopup = {this._components.autoCompletePopup}
        registerCommand = {this.registerCommand}
        command = {this.commands}
        version = {this.version}
        config = {this.config}
        thisState = {this}
        vm = {this.vm}
        blockchain = {this.blockchain}
        commandHelp = {this.commandHelp}
        event = {this.event}
        _deps = {this._deps}
        fileImport = {this.fileImport}
        sourceHighlighter = {this.sourceHighlighter}
        gistHandler ={this.gistHandler}
        registry = {this.registry}
        commands = {this.commands}
        txListener = {this.txListener}
        eventsDecoder = {this.eventsDecoder}
      />,
      this.element
    )
  }

  // _appendItem (item) {
  //   var self = this
  //   var { el, gidx } = item
  //   self._JOURNAL[gidx] = item
  //   if (!self._jobs.length) {
  //     requestAnimationFrame(function updateTerminal () {
  //       self._jobs.forEach(el => self._view.journal.appendChild(el))
  //       self.scroll2bottom()
  //       self._jobs = []
  //     })
  //   }
  //   if (self.data.activeFilters.commands[item.cmd]) self._jobs.push(el)
  // }

  scroll2bottom () {
    var self = this
    setTimeout(function () {
      // self._view.term.scrollTop = self._view.term.scrollHeight
    }, 0)
  }

  //   _blocksRenderer (mode) {
  //     if (mode === 'html') {
  //       return function logger (args, scopedCommands, append) {
  //         if (args.length) append(args[0])
  //       }
  //     }
  //     mode = {
  //       log: 'text-info',
  //       info: 'text-info',
  //       warn: 'text-warning',
  //       error: 'text-danger'
  //     }[mode] // defaults

  //     if (mode) {
  //       const filterUndefined = (el) => el !== undefined && el !== null
  //       return function logger (args, scopedCommands, append) {
  //         var types = args.filter(filterUndefined).map(type)
  //         var values = javascriptserialize.apply(null, args.filter(filterUndefined)).map(function (val, idx) {
  //           if (typeof args[idx] === 'string') {
  //             const el = document.createElement('div')
  //             el.innerHTML = args[idx].replace(/(\r\n|\n|\r)/gm, '<br>')
  //             val = el.children.length === 0 ? el.firstChild : el
  //           }
  //           if (types[idx] === 'element') val = jsbeautify.html(val)
  //           return val
  //         })
  //         if (values.length) {
  //           append(yo`<span class="${mode}" >${values}</span>`)
  //         }
  //       }
  //     } else {
  //       throw new Error('mode is not supported')
  //     }
  //   }

  //   _scopeCommands (append) {
  //     var self = this
  //     var scopedCommands = {}
  //     Object.keys(self.commands).forEach(function makeScopedCommand (cmd) {
  //       var command = self._commands[cmd]
  //       scopedCommands[cmd] = function _command () {
  //         var args = [...arguments]
  //         command(args, scopedCommands, el => append(cmd, args, blockify(el)))
  //       }
  //     })
  //     return scopedCommands
  //   }

  //   registerFilter (commandName, filterFn) {
  //     this.data.filterFns[commandName] = filterFn
  //   }

  //   registerCommand (name, command, opts) {
  //     var self = this
  //     name = String(name)
  //     if (this._commands[name]) throw new Error(`command "${name}" exists already`)
  //     if (typeof command !== 'function') throw new Error(`invalid command: ${command}`)
  //     this._commands[name] = command
  //     console.log({ command })
  //     console.log(self._commands)
  //     this._INDEX.commands[name] = []
  //     this._INDEX.commandsMain[name] = []
  //     this.commands[name] = function _command () {
  //       var args = [...arguments]
  //       var steps = []
  //       var root = { steps, cmd: name }
  //       var ITEM = { root, cmd: name }
  //       root.gidx = self._INDEX.allMain.push(ITEM) - 1
  //       root.idx = self._INDEX.commandsMain[name].push(ITEM) - 1
  //       function append (cmd, params, el) {
  //         var item
  //         if (cmd) { // subcommand
  //           item = { el, cmd, root }
  //         } else { // command
  //           item = ITEM
  //           item.el = el
  //           cmd = name
  //         }
  //         item.gidx = self._INDEX.all.push(item) - 1
  //         item.idx = self._INDEX.commands[cmd].push(item) - 1
  //         item.step = steps.push(item) - 1
  //         item.args = params
  //         // self._appendItem(item)
  //       }
  //       var scopedCommands = self._scopeCommands(append)
  //       command(args, scopedCommands, el => append(null, args, blockify(el)))
  //     }
  //     var help = typeof command.help === 'string' ? command.help : [
  //       '// no help available for:',
  //       `terminal.commands.${name}(...)`
  //     ].join('\n')
  //     this.commands[name].toString = _ => { return help }
  //     this.commands[name].help = help
  //     this.data.activeFilters.commands[name] = opts && opts.activate
  //     if (opts.filterFn) {
  //       this.registerFilter(name, opts.filterFn)
  //     }
  //     return this.commands[name]
  //   }

  //   async _shell (script, scopedCommands, done) { // default shell
  //     if (script.indexOf('remix:') === 0) {
  //       return done(null, 'This type of command has been deprecated and is not functionning anymore. Please run remix.help() to list available commands.')
  //     }
  //     var self = this
  //     if (script.indexOf('remix.') === 0) {
  //       // we keep the old feature. This will basically only be called when the command is querying the "remix" object.
  //       // for all the other case, we use the Code Executor plugin
  //       var context = domTerminalFeatures(scopedCommands, self.blockchain)
  //       try {
  //         var cmds = vm.createContext(context)
  //         var result = vm.runInContext(script, cmds)
  //         return done(null, result)
  //       } catch (error) {
  //         return done(error.message)
  //       }
  //     }
  //     try {
  //       let result
  //       if (script.trim().startsWith('git')) {
  //         // result = await this.call('git', 'execute', script)
  //       } else {
  //         result = await this.call('scriptRunner', 'execute', script)
  //       }
  //       if (result) self.commands.html(yo`<pre>${result}</pre>`)
  //       done()
  //     } catch (error) {
  //       done(error.message || error)
  //     }
  //   }
  // }

  // function domTerminalFeatures (scopedCommands, blockchain) {
  //   return {
  //     remix: {
  //       blockchain: this.blockchain,
  //       commandHelp: this.commandHelp,
  //       event: this.event,
  //       _deps: this._deps
  //     }
  //   }
  // }

  // function loadgist (id, cb) {
  //   const self = this
  //   self._components.gistHandler.loadFromGist({ gist: id }, this._deps.fileManager)
  //   if (cb) cb()
  // }

  // function loadurl (url, cb) {
  //   const self = this
  //   self._components.fileImport.import(url,
  //     (loadingMsg) => { toolTip(loadingMsg) },
  //     (err, content, cleanUrl, type, url) => {
  //       if (err) {
  //         toolTip(`Unable to load ${url}: ${err}`)
  //         if (cb) cb(err)
  //       } else {
  //         self._deps.fileManager.writeFile(type + '/' + cleanUrl, content)
  //         try {
  //           content = JSON.parse(content)
  //           async.eachOfSeries(content.sources, (value, file, callbackSource) => {
  //             var url = value.urls[0] // @TODO retrieve all other contents ?
  //             self._components.fileImport.import(url,
  //               (loadingMsg) => { toolTip(loadingMsg) },
  //               async (error, content, cleanUrl, type, url) => {
  //                 if (error) {
  //                   toolTip(`Cannot retrieve the content of ${url}: ${error}`)
  //                   return callbackSource(`Cannot retrieve the content of ${url}: ${error}`)
  //                 } else {
  //                   try {
  //                     await self._deps.fileManager.writeFile(type + '/' + cleanUrl, content)
  //                     callbackSource()
  //                   } catch (e) {
  //                     callbackSource(e.message)
  //                   }
  //                 }
  //               })
  //           }, (error) => {
  //             if (cb) cb(error)
  //           })
  //         } catch (e) {}
  //         if (cb) cb()
  //       }
  //     })
  // }

  // function exeCurrent (cb) {
  //   return this.execute(undefined, cb)
  // }

  // function execute (file, cb) {
  //   const self = this

  //   function _execute (content, cb) {
  //     if (!content) {
  //       toolTip('no content to execute')
  //       if (cb) cb()
  //       return
  //     }

  //     self._components.terminal.commands.script(content)
  //   }

  //   if (typeof file === 'undefined') {
  //     var content = self._deps.editor.currentContent()
  //     _execute(content, cb)
  //     return
  //   }

  //   var provider = self._deps.fileManager.fileProviderOf(file)

  //   if (!provider) {
  //     toolTip(`provider for path ${file} not found`)
  //     if (cb) cb()
  //     return
  //   }

  //   provider.get(file, (error, content) => {
  //     if (error) {
  //       // toolTip(error)
  //       // TODO: pop up
  //       if (cb) cb()
  //       return
  //     }

  //     _execute(content, cb)
  //   })
  // }

// function help (cb) {
//   const self = this
//   var help = yo`<div></div>`
//   for (var k in self.commandHelp) {
//     help.appendChild(yo`<div>${k}: ${self.commandHelp[k]}</div>`)
//     help.appendChild(yo`<br>`)
//   }
//   self._components.terminal.commands.html(help)
//   if (cb) cb()
//   return ''
// }
}
function blockify (el) { return yo`<div class="px-4 ${css.block}" data-id="block_${el.getAttribute ? el.getAttribute('id') : ''}">${el}</div>` }

module.exports = Terminal
