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
    if (self.view) self.view.querySelector('#staticAnalysisCurrentFile').innerText = file
    self.lastCompilationSource = source
    if (self.view.querySelector('#autorunstaticanalysis').checked) {
      self.run()
    }
  })
}

staticAnalysisView.prototype.render = function () {
  this.runBtn = yo`<button class="btn btn-sm w-25 btn-primary" onclick="${() => { this.run() }}" >Run</button>`
  const view = yo`
    <div class="${css.analysis}">
      <div class="my-2 d-flex flex-column align-items-left">
        <div class="d-flex justify-content-between">
          ${this.runBtn}
          <div class="${css.label}" for="autorunstaticanalysis">
            <input id="autorunstaticanalysis"
              type="checkbox"
              style="vertical-align:bottom"
              checked="true"
            >
            <label class="text-nowrap pl-2 mb-0" for="autorunstaticanalysis">
              Autorun
            </label>
          </div>
          <div class="${css.label}" for="checkAllEntries">
            <input id="checkAllEntries"
              type="checkbox"
              onclick="${(event) => { this.checkAll(event) }}"
              style="vertical-align:bottom"
              checked="true"
            >
            <label class="text-nowrap pl-2 mb-0" for="checkAllEntries">
              Select all
            </label>
          </div>
        </div>
      </div>
      <div id="staticanalysismodules" class="list-group list-group-flush">
        ${this.modulesView}
      </div>
      <div class="my-2 p-2 d-flex flex-column alert alert-info">
        <span>Analysis for:</span>
        <span class="text-break break-word word-break font-weight-bold" id="staticAnalysisCurrentFile">No file compiled</span>
      </div>
      <div class="${css.result} my-2" id='staticanalysisresult'></div>
    </div>
  `

  if (!this.view) {
    this.view = view
  }
  this.correctRunBtnDisabled()
  return view
}

staticAnalysisView.prototype.selectedModules = function () {
  if (!this.view) {
    return []
  }
  const selected = this.view.querySelectorAll('[name="staticanalysismodule"]:checked')
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
  const selected = this.selectedModules()
  const warningContainer = $('#staticanalysisresult')
  warningContainer.empty()
  var self = this
  if (this.lastCompilationResult && selected.length) {
    this.runBtn.removeAttribute('disabled')
    let warningCount = 0
    this.runner.run(this.lastCompilationResult, selected, function (results) {
      results.map(function (result, i) {
        result.report.map(function (item, i) {
          let location = ''
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
          const msg = yo`<span>${location} ${item.warning} ${item.more ? yo`<span><br><a href="${item.more}" target="blank">more</a></span>` : yo`<span></span>`}</span>`
          self._components.renderer.error(msg, warningContainer, {type: 'staticAnalysisWarning alert alert-warning', useSpan: true})
        })
      })
      self.event.trigger('staticAnaysisWarning', [warningCount])
    })
  } else {
    this.runBtn.setAttribute('disabled', 'disabled')
    if (selected.length) {
      warningContainer.html('No compiled AST available')
    }
    self.event.trigger('staticAnaysisWarning', [-1])
  }
}
staticAnalysisView.prototype.checkModule = function (event) {
  const selected = this.view.querySelectorAll('[name="staticanalysismodule"]:checked')
  const checkAll = this.view.querySelector('[id="checkAllEntries"]')
  this.correctRunBtnDisabled()
  if (event.target.checked) {
    checkAll.checked = true
  } else if (!selected.length) {
    checkAll.checked = false
  }
}
staticAnalysisView.prototype.correctRunBtnDisabled = function () {
  const selected = this.view.querySelectorAll('[name="staticanalysismodule"]:checked')
  if (this.lastCompilationResult && selected.length !== 0) {
    this.runBtn.removeAttribute('disabled')
  } else {
    this.runBtn.setAttribute('disabled', 'disabled')
  }
}
staticAnalysisView.prototype.checkAll = function (event) {
  if (!this.view) {
    return
  }
  // checks/unchecks all
  const checkBoxes = this.view.querySelectorAll('[name="staticanalysismodule"]')
  checkBoxes.forEach((checkbox) => { checkbox.checked = event.target.checked })
  this.correctRunBtnDisabled()
}

staticAnalysisView.prototype.renderModules = function () {
  const groupedModules = utils.groupBy(preProcessModules(this.runner.modules()), 'categoryId')
  const moduleEntries = Object.keys(groupedModules).map((categoryId, i) => {
    const category = groupedModules[categoryId]
    const entriesDom = category.map((item, i) => {
      return yo`
        <div class="form-check">
          <input id="staticanalysismodule_${categoryId}_${i}"
            type="checkbox"
            class="form-check-input staticAnalysisItem"
            name="staticanalysismodule"
            index=${item._index}
            checked="true"
            style="vertical-align:bottom"
            onclick="${(event) => this.checkModule(event)}"
          >
          <label for="staticanalysismodule_${categoryId}_${i}" class="form-check-label mb-1">
            <p class="mb-0 font-weight-bold text-capitalize">${item.name}</p>
            ${item.description}
          </label>
        </div>
      `
    })
    return yo`
      <div class="${css.block}">
          <input type="radio" name="accordion" class="w-100 d-none card" id="heading${categoryId}"/>
          <label for="heading${categoryId}" style="cursor: pointer;" class="h6 card-header font-weight-bold border-bottom px-1 py-2 w-100">
            <span>${category[0].categoryDisplayName}</span>
          </label>
        <div class="w-100 d-block px-2 my-1 ${css.entries}">
          ${entriesDom}
        </div>
      </>
    `
  })
  return yo`
    <div class="accordion" id="accordionModules">
      ${moduleEntries}
    </div>`
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
