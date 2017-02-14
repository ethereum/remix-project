'use strict'
var StaticAnalysisRunner = require('./staticAnalysisRunner.js')
var yo = require('yo-yo')
var $ = require('jquery')

function staticAnalysisView (appAPI, compilerEvent) {
  this.view = null
  this.appAPI = appAPI
  this.runner = new StaticAnalysisRunner()
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
    <label for="autorunstaticanalysis"><input id="autorunstaticanalysis" type="checkbox" checked="true">Auto run</label>
    <div id="staticanalysismodules">
    ${this.modulesView}
    </div>
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
  var selected = this.view.querySelectorAll('[name="staticanalysismodule"]:checked')
  var toRun = []
  for (var i = 0; i < selected.length; i++) {
    toRun.push(selected[i].attributes['index'].value)
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
    this.runner.run(this.lastCompilationResult, selected, function (results) {
      results.map(function (result, i) {
        result.report.map(function (item, i) {
          var location = ''
          if (item.location !== undefined) {
            var split = item.location.split(':')
            var file = split[2]
            location = {
              start: parseInt(split[0]),
              length: parseInt(split[1])
            }
            location = self.appAPI.offsetToLineColumn(location, file)
            location = self.lastCompilationResult.sourceList[file] + ':' + (location.start.line + 1) + ':' + (location.start.column + 1) + ':'
          }
          self.appAPI.renderWarning(location + ' ' + item.warning, warningContainer, {type: 'warning', useSpan: true, isHTML: true})
        })
      })
      if (warningContainer.html() === '') {
        $('#header #menu .staticanalysisView').css('color', '')
        warningContainer.html('No warning to report')
      } else {
        $('#header #menu .staticanalysisView').css('color', '#FF8B8B')
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
