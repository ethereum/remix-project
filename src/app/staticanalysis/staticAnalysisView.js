'use strict'
var StaticAnalysisRunner = require('./staticAnalysisRunner.js')
var yo = require('yo-yo')
var $ = require('jquery')
var EventManager = require('../../lib/eventManager')

function staticAnalysisView (compilerEvent, renderer, editor, offsetToColumnConverter) {
  this.event = new EventManager()
  this.view = null
  this.renderer = renderer
  this.editor = editor
  this.runner = new StaticAnalysisRunner()
  this.offsetToColumnConverter = offsetToColumnConverter
  this.modulesView = renderModules(this.runner.modules())
  this.lastCompilationResult = null
  var self = this
  compilerEvent.register('compilationFinished', function (success, data, source) {
    self.lastCompilationResult = null
    $('#staticanalysisresult').empty()
    if (success) {
      self.lastCompilationResult = data
      if (self.view.querySelector('#autorunstaticanalysis').checked) {
        self.run()
      }
    }
  })
}

staticAnalysisView.prototype.render = function () {
  var self = this
  var view = yo`<div>
    <strong>Static Analysis</strong>
    <div>Select analyser to run against current compiled contracts <label><input id="autorunstaticanalysis" type="checkbox" checked="true">Auto run Static Analysis</label></div>    
    <br />
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
  if (this.lastCompilationResult) {
    var self = this
    this.runner.run(this.lastCompilationResult.sources, selected, function (results) {
      results.map(function (result, i) {
        result.report.map(function (item, i) {
          var split = item.location.split(':')
          var file = split[2]
          var location = {
            start: parseInt(split[0]),
            length: parseInt(split[1])
          }
          location = self.offsetToColumnConverter.offsetToLineColumn(location, file, self.editor, self.lastCompilationResult)
          location = self.lastCompilationResult.sourceList[file] + ':' + (location.start.line + 1) + ':' + (location.start.column + 1) + ':'
          self.renderer.error(location + ' ' + item.warning, warningContainer, false, 'warning')
        })
      })
      if (warningContainer.html() === '') {
        warningContainer.html('No warning to report')
      } else {
        self.event.trigger('warning', [])
      }
    })
  } else {
    warningContainer.html('No compiled AST available')
  }
}

module.exports = staticAnalysisView

function renderModules (modules) {
  return modules.map(function (item, i) {
    return yo`<label><input id="staticanalysismodule${i}" type="checkbox" name="staticanalysismodule" index=${i} checked="true">${item.name} (${item.description})</label>`
  })
}
