'use strict'
var EventManager = require('./src/eventManager')
var traceHelper = require('./src/helpers/traceHelper')
var uiHelper = require('./src/helpers/uiHelper')
var SourceMappingDecoder = require('./src/sourceMappingDecoder')
var SourceLocationTracker = require('./src/sourceLocationTracker')
var init = require('./src/init')
var util = require('./src/util')
var Web3Providers = require('./src/web3Provider/web3Providers')
var DummyProvider = require('./src/web3Provider/dummyProvider')
var AstWalker = require('./src/astWalker')
var global = require('./src/global')

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
      ui: uiHelper
    },
    vm: {
      Web3Providers: Web3Providers,
      DummyProvider: DummyProvider
    },
    SourceMappingDecoder: SourceMappingDecoder,
    SourceLocationTracker: SourceLocationTracker,
    init: init,
    util: util,
    AstWalker: AstWalker,
    global: global
  }
}
