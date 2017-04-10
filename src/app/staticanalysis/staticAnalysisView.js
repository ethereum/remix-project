'use strict'
var StaticAnalysisRunner = require('./staticAnalysisRunner.js')
var yo = require('yo-yo')
var $ = require('jquery')
var utils = require('../utils')
var csjs = require('csjs-inject')

var css = csjs`
  .analysis {
    margin-top: 2em;
    font-height: 1.5em;
  }
`

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
  var view = yo`<div class="${css.analysis}">
    <strong>Static Analysis</strong>
    <label for="autorunstaticanalysis"><input id="autorunstaticanalysis" type="checkbox" style="vertical-align:bottom" checked="true">Auto run</label>
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
          self.appAPI.renderWarning(location + ' ' + item.warning + ((item.more) ? '<br><a href="' + item.more + '" target="blank">more</a>' : ''), warningContainer, {type: 'warning', useSpan: true, isHTML: true})
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
  var groupedModules = utils.groupBy(preProcessModules(modules), 'categoryId')
  return Object.keys(groupedModules).map((categoryId, i) => {
    var category = groupedModules[categoryId]
    var entriesDom = category.map((item, i) => {
      return yo`
        <label>
          <input id="staticanalysismodule_${categoryId}_${i}"
            type="checkbox"
            name="staticanalysismodule"
            index=${item._index}
            checked="true" style="vertical-align:bottom">
          ${item.name}
          ${item.description}
        </label>
            `
    })
    return yo`<div>
                <br>
                <label>
                <b>${category[0].categoryDisplayName}</b>
                </label>
                ${entriesDom}
              </div>`
  })
}

function preProcessModules (arr) {
  return arr.map((item, i) => {
    item['_index'] = i
    item.categoryDisplayName = item.category.displayName
    item.categoryId = item.category.id
    return item
  })
}
