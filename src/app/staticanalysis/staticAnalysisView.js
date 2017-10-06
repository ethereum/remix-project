'use strict'
var StaticAnalysisRunner = require('./staticAnalysisRunner.js')
var yo = require('yo-yo')
var $ = require('jquery')
var utils = require('../../lib/utils')
var csjs = require('csjs-inject')

var remix = require('ethereum-remix')
var styleGuide = remix.ui.styleGuide
var styles = styleGuide()

var EventManager = require('ethereum-remix').lib.EventManager

var css = csjs`
  .analysis {
    display: flex;
    flex-direction: column;
  }
  .result {
    margin-top: 1%;
  }
  .buttons  {
    ${styles.rightPanel.analysisTab.box_AnalysisContainer}
    display: flex;
    align-items: center;
  }
  .buttonRun  {
    ${styles.rightPanel.analysisTab.button_Run_AnalysisTab}
    margin-right: 1%;
  }
  .analysisModulesContainer {
    ${styles.rightPanel.analysisTab.box_AnalysisContainer}
    margin-bottom: 1%;
    line-height: 2em;
    display: flex;
    flex-direction: column;
  }
  .label {
    display: flex;
    align-items: center;
  }
`

function staticAnalysisView (appAPI, compilerEvent) {
  this.event = new EventManager()
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
  var view = yo`
    <div class="${css.analysis}">
      <div id="staticanalysismodules">
        ${this.modulesView}
      </div>
      <div class="${css.buttons}">
        <button class=${css.buttonRun} onclick=${function () { self.run() }} >Run</button>
        <label class="${css.label}" for="autorunstaticanalysis"><input id="autorunstaticanalysis" type="checkbox" style="vertical-align:bottom" checked="true">Auto run</label>
      </div>
      <div class="${css.result}" "id='staticanalysisresult'></div>
    </div>
  `
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
    var warningCount = 0
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
          warningCount++
          self.appAPI.renderWarning(location + ' ' + item.warning + ((item.more) ? '<br><a href="' + item.more + '" target="blank">more</a>' : ''), warningContainer, {type: 'warning', useSpan: true, isHTML: true})
        })
      })
      if (warningContainer.html() === '') {
        $('#righthand-panel #menu .staticanalysisView').css('color', '')
        warningContainer.html('No warning to report')
      } else {
        $('#righthand-panel #menu .staticanalysisView').css('color', styles.colors.red)
      }
      self.event.trigger('staticAnaysisWarning', [warningCount])
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
        <label class="${css.label}">
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
    return yo`<div class="${css.analysisModulesContainer}">
                <label class="${css.label}"><b>${category[0].categoryDisplayName}</b></label>
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
