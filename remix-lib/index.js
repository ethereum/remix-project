'use strict'
var EventManager = require('./src/eventManager')
var traceHelper = require('./src/helpers/traceHelper')
var uiHelper = require('./src/helpers/uiHelper')
var compilerHelper = require('./src/helpers/compilerHelper')
var SourceMappingDecoder = require('./src/sourceMappingDecoder')
var SourceLocationTracker = require('./src/sourceLocationTracker')
var init = require('./src/init')
var util = require('./src/util')
var Web3Providers = require('./src/web3Provider/web3Providers')
var DummyProvider = require('./src/web3Provider/dummyProvider')
var Web3VMProvider = require('./src/web3Provider/web3VmProvider')
var AstWalker = require('./src/astWalker')
var global = require('./src/global')
var styleGuide = require('./src/ui/style-guide')
var styleGuideDark = require('./src/ui/styleGuideDark')
var themeChooser = require('./src/ui/theme-chooser')
var Storage = require('./src/storage')

var EventsDecoder = require('./src/execution/eventsDecoder')
var txExecution = require('./src/execution/txExecution')

if (typeof (module) !== 'undefined' && typeof (module.exports) !== 'undefined') {
  module.exports = modules()
}

if (typeof (window) !== 'undefined') {
  window.remix = modules()
}

function modules () {
  return {
    EventManager: EventManager,
    helpers: {
      trace: traceHelper,
      ui: uiHelper,
      compiler: compilerHelper
    },
    vm: {
      Web3Providers: Web3Providers,
      DummyProvider: DummyProvider,
      Web3VMProvider: Web3VMProvider
    },
    SourceMappingDecoder: SourceMappingDecoder,
    SourceLocationTracker: SourceLocationTracker,
    Storage: Storage,
    init: init,
    util: util,
    AstWalker: AstWalker,
    global: global,
    ui: {
      styleGuide: styleGuide,
      styleGuideDark: styleGuideDark,
      themeChooser: themeChooser
    },
    execution: {
      EventsDecoder: EventsDecoder,
      txExecution: txExecution
    }
  }
}
