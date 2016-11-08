'use strict'
var StaticAnalysisRunner = require('./staticAnalysisRunner.js')
var yo = require('yo-yo')
var $ = require('jquery')

function staticAnalysisView (compiler, renderer) {
  this.view = null
  this.renderer = renderer
  this.runner = new StaticAnalysisRunner()
  this.modulesView = renderModules(this.runner.modules())
  this.lastASTs = null
  var self = this
  compiler.event.register('compilationFinished', function (success, data, source) {
    self.lastASTs = null
    if (success) {
      self.lastASTs = data.sources
    }
  })
}

staticAnalysisView.prototype.render = function () {
  var self = this
  var view = yo`<div>
    <strong>Static Analysis</strong>
    <div>Select analyser to run against current compiled contracts</div>
    ${this.modulesView}
    <div>
      <button onclick=${function () { self.run() }} >Run</button>
    </div>
    <div id='staticanalysisresult'></div>
    </div>`
  if (!this.view) {
    this.view = view
  }
  return view
}

staticAnalysisView.prototype.selectedModules = function () {
  if (!this.view) {
    return []
  }
  var selected = this.view.querySelectorAll('[name="staticanalysismodule"]')
  var toRun = []
  for (var i = 0; i < selected.length; i++) {
    var el = selected[i]
    if (el.checked) {
      var analyser = this.runner.modules()[el.attributes['index'].value]
      toRun.push(new analyser.Module())
    }
  }
  return toRun
}

staticAnalysisView.prototype.run = function () {
  if (!this.view) {
    return
  }
  var selected = this.selectedModules()
  var warningContainer = $('#staticanalysisresult')
  warningContainer.empty()
  if (this.lastASTs) {
    var self = this
    this.runner.run(this.lastASTs, selected, function (results) {
      results.map(function (item, i) {
        self.renderer.error(item.name + ':\n\n' + item.report, warningContainer, null, 'warning')
      })
    })
  } else {
    warningContainer.html('No compiled AST available')
  }
}

function renderModules (modules) {
  return modules.map(function (item, i) {
    return yo`<div><input type="checkbox" name="staticanalysismodule" checked='true' index=${i} >${item.name} (${item.description})</div>`
  })
}

module.exports = staticAnalysisView
