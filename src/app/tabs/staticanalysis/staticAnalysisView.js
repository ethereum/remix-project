'use strict'
var StaticAnalysisRunner = require('remix-analyzer').CodeAnalysis
var yo = require('yo-yo')
var $ = require('jquery')
var remixLib = require('remix-lib')
var utils = remixLib.util
var css = require('./styles/staticAnalysisView-styles')
var Renderer = require('../../ui/renderer')

var EventManager = require('../../../lib/events')

function staticAnalysisView (localRegistry, analysisModule) {
  var self = this
  this.event = new EventManager()
  this.view = null
  this.runner = new StaticAnalysisRunner()
  this.modulesView = this.renderModules()
  this.lastCompilationResult = null
  this.lastCompilationSource = null
  self._components = {
    renderer: new Renderer()
  }
  self._components.registry = localRegistry
  // dependencies
  self._deps = {
    offsetToLineColumnConverter: self._components.registry.get('offsettolinecolumnconverter').api
  }

  analysisModule.on('solidity', 'compilationFinished', (file, source, languageVersion, data) => {
    self.lastCompilationResult = null
    self.lastCompilationSource = null
    $('#staticanalysisresult').empty()
    if (languageVersion.indexOf('soljson') !== 0) return
    self.lastCompilationResult = data
    self.lastCompilationSource = source
    if (self.view.querySelector('#autorunstaticanalysis').checked) {
      self.run()
    }
  })
}

staticAnalysisView.prototype.render = function () {
  var self = this
  var view = yo`
    <div class="${css.analysis}">
      <div class="${css.buttons}">
          <div class="${css.buttonsInner}">
            <button class="${css.buttonRun} btn btn-sm btn-primary" onclick="${function () { self.run() }}" >Run</button>
            <div class="${css.label}" for="autorunstaticanalysis">
              <input id="autorunstaticanalysis"
                type="checkbox"
                style="vertical-align:bottom"
                checked="true"
              >
              <label class="text-nowrap pl-2 mb-0" for="autorunstaticanalysis">
                Auto run
              </label>
            </div>
            <div class="${css.label}" for="checkAllEntries">
              <input id="checkAllEntries"
                type="checkbox"
                onclick="${function (event) { self.checkAll(event) }}"
                style="vertical-align:bottom"
                checked="true"
              >
              <label class="text-nowrap pl-2 mb-0" for="checkAllEntries">
                Check/Uncheck all
              </label>
            </div>
          </div>
        </div>
        <div id="staticanalysismodules" class="list-group list-group-flush ${css.container}">
          ${this.modulesView}
        </div>
        <div class="${css.resultTitle} mx-2"><h6>Results:</h6></div>
        <div class="${css.result} m-2" id='staticanalysisresult'></div>
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
  var self = this
  if (this.lastCompilationResult && selected.length) {
    var warningCount = 0
    this.runner.run(this.lastCompilationResult, selected, function (results) {
      results.map(function (result, i) {
        result.report.map(function (item, i) {
          var location = ''
          if (item.location) {
            var split = item.location.split(':')
            var file = split[2]
            location = {
              start: parseInt(split[0]),
              length: parseInt(split[1])
            }
            location = self._deps.offsetToLineColumnConverter.offsetToLineColumn(location,
              parseInt(file),
              self.lastCompilationSource.sources,
              self.lastCompilationResult.sources)
            location = Object.keys(self.lastCompilationResult.contracts)[file] + ':' + (location.start.line + 1) + ':' + (location.start.column + 1) + ':'
          }
          warningCount++
          var msg = yo`<span>${location} ${item.warning} ${item.more ? yo`<span><br><a href="${item.more}" target="blank">more</a></span>` : yo`<span></span>`}</span>`
          self._components.renderer.error(msg, warningContainer, {type: 'staticAnalysisWarning alert alert-warning', useSpan: true})
        })
      })
      self.event.trigger('staticAnaysisWarning', [warningCount])
    })
  } else {
    if (selected.length) {
      warningContainer.html('No compiled AST available')
    }
    self.event.trigger('staticAnaysisWarning', [-1])
  }
}

staticAnalysisView.prototype.checkModule = function (event) {
  let selected = this.view.querySelectorAll('[name="staticanalysismodule"]:checked')
  let checkAll = this.view.querySelector('[id="checkAllEntries"]')
  if (event.target.checked) {
    checkAll.checked = true
  } else if (!selected.length) {
    checkAll.checked = false
  }
}

staticAnalysisView.prototype.checkAll = function (event) {
  if (!this.view) {
    return
  }
  // checks/unchecks all
  var checkBoxes = this.view.querySelectorAll('[name="staticanalysismodule"]')
  checkBoxes.forEach((checkbox) => { checkbox.checked = event.target.checked })
}

staticAnalysisView.prototype.renderModules = function () {
  var self = this
  var groupedModules = utils.groupBy(preProcessModules(self.runner.modules()), 'categoryId')
  return Object.keys(groupedModules).map((categoryId, i) => {
    var category = groupedModules[categoryId]
    var entriesDom = category.map((item, i) => {
      return yo`
        <div class="form-check">
          <input id="staticanalysismodule_${categoryId}_${i}"
            type="checkbox"
            class="form-check-input staticAnalysisItem"
            name="staticanalysismodule"
            index=${item._index}
            checked="true"
            style="vertical-align:bottom"
            onclick="${function (event) { self.checkModule(event) }}"
          >
          <label for="staticanalysismodule_${categoryId}_${i}" class="form-check-label mb-1">
            ${item.name}
            ${item.description}
          </label>
        </div>
            `
    })
    return yo`
      <div class="${css.analysisModulesContainer} list-group-item py-1">
        <label class="${css.label}"><b>${category[0].categoryDisplayName}</b></label>
        ${entriesDom}
      </div>`
  })
}

module.exports = staticAnalysisView

/**
 * @dev Process & categorize static analysis modules to show them on UI
 * @param arr list of static analysis modules received from remix-analyzer module
 */
function preProcessModules (arr) {
  return arr.map((Item, i) => {
    const itemObj = new Item()
    itemObj['_index'] = i
    itemObj.categoryDisplayName = itemObj.category.displayName
    itemObj.categoryId = itemObj.category.id
    return itemObj
  })
}
