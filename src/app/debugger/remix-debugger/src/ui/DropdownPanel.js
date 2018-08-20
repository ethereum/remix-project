'use strict'
var yo = require('yo-yo')
const copy = require('clipboard-copy')
var remixLib = require('remix-lib')
var TreeView = require('../../../../ui/TreeView') // TODO setup a direct reference to the UI components
var EventManager = remixLib.EventManager

var csjs = require('csjs-inject')
var styleGuide = require('../../../../ui/styles-guide/theme-chooser')
var styles = styleGuide.chooser()

var css = csjs`
  .title {
    margin-top: 10px;
    ${styles.rightPanel.debuggerTab.dropdown_Debugger};
    display: flex;
    align-items: center;
  }
  .name {
    font-weight: bold;
  }
  .nameDetail {
    font-weight: bold;
    margin-left: 3px;
  }
  .icon {
    color: ${styles.rightPanel.debuggerTab.button_Debugger_icon_Color};
    margin-right: 5%;
  }
  .eyeButton {
    margin: 3px;
  }
  .eyeButton:hover {
    color: ${styles.rightPanel.debuggerTab.button_Debugger_icon_HoverColor};
  }
  .dropdownpanel {
    ${styles.rightPanel.debuggerTab.dropdown_Debugger};
    width: 100%;
  }
  .dropdownrawcontent {
    padding: 2px;
    word-break: break-all;
  }
  .message {
    padding: 2px;
    word-break: break-all;
  }
  .refresh {
    display: none;
    margin-left: 4px;
    margin-top: 4px; 
    animation: spin 2s linear infinite;
  }
`

function DropdownPanel (_name, _opts) {
  this.event = new EventManager()
  if (!_opts) {
    _opts = {}
  }
  this.name = _name
  this.header = ''
  this.json = _opts.json
  this.displayContentOnly = _opts.displayContentOnly
  if (this.json) {
    this.treeView = new TreeView(_opts)
  }
  this.view
}

DropdownPanel.prototype.setMessage = function (message) {
  if (this.view) {
    this.view.querySelector('.dropdownpanel .dropdownrawcontent').style.display = 'none'
    this.view.querySelector('.dropdownpanel .dropdowncontent').style.display = 'none'
    this.view.querySelector('.dropdownpanel .fa-refresh').style.display = 'none'
    this.message(message)
  }
}

DropdownPanel.prototype.setLoading = function () {
  if (this.view) {
    this.view.querySelector('.dropdownpanel .dropdownrawcontent').style.display = 'none'
    this.view.querySelector('.dropdownpanel .dropdowncontent').style.display = 'none'
    this.view.querySelector('.dropdownpanel .fa-refresh').style.display = 'inline-block'
    this.message('')
  }
}

DropdownPanel.prototype.setUpdating = function () {
  if (this.view) {
    this.view.querySelector('.dropdownpanel .dropdowncontent').style.color = styles.appProperties.greyedText_color
  }
}

DropdownPanel.prototype.update = function (_data, _header) {
  if (this.view) {
    this.view.querySelector('.dropdownpanel .fa-refresh').style.display = 'none'
    this.view.querySelector('.dropdownpanel .dropdowncontent').style.display = 'block'
    this.view.querySelector('.dropdownpanel .dropdowncontent').style.color = styles.appProperties.mainText_Color
    this.view.querySelector('.dropdownpanel .dropdownrawcontent').innerText = JSON.stringify(_data, null, '\t')
    if (!this.displayContentOnly) {
      this.view.querySelector('.title div.btn').style.display = 'block'
      this.view.querySelector('.title span').innerText = _header || ' '
    }
    this.message('')
    if (this.json) {
      this.treeView.update(_data)
    }
  }
}

DropdownPanel.prototype.setContent = function (node) {
  if (this.view) {
    var parent = this.view.querySelector('.dropdownpanel div.dropdowncontent')
    parent.replaceChild(node, parent.firstElementChild)
  }
}

DropdownPanel.prototype.render = function (overridestyle) {
  var content = yo`<div>Empty</div>`
  if (this.json) {
    content = this.treeView.render({})
  }
  overridestyle === undefined ? {} : overridestyle
  var self = this
  var title = !self.displayContentOnly ? yo`<div class="${css.title} title">
      <div class="${css.icon} fa fa-caret-right" onclick=${function () { self.toggle() }} ></div>
      <div class="${css.name}" onclick=${function () { self.toggle() }} >${this.name}</div><span class="${css.nameDetail}" onclick=${function () { self.toggle() }} ></span>
      <div onclick=${function () { self.copyClipboard() }} title='raw' class="${css.eyeButton} btn fa fa-clipboard"></div>
    </div>` : yo`<div></div>`

  var contentNode = yo`<div class='dropdownpanel' style='display:none'>
      <i class="${css.refresh} fa fa-refresh" aria-hidden="true"></i>
      <div class='dropdowncontent'>${content}</div>
      <div class='dropdownrawcontent' style='display:none'></div>
      <div class='message' style='display:none'></div>
    </div>`
  var view = yo`
    <div>
    <style>
      @-moz-keyframes spin {
        to { -moz-transform: rotate(359deg); }
      }
      @-webkit-keyframes spin {
        to { -webkit-transform: rotate(359deg); }
      }
      @keyframes spin {
        to {transform:rotate(359deg);}
      }
    </style>
    ${title}
    ${contentNode}
    </div>`
  if (!this.view) {
    this.view = view
  }
  if (self.displayContentOnly) contentNode.style.display = 'block'
  return view
}

DropdownPanel.prototype.copyClipboard = function () {
  var content = this.view.querySelector('.dropdownpanel .dropdownrawcontent')
  if (content) copy(content.innerText ? content.innerText : content.textContent)
}

DropdownPanel.prototype.toggle = function () {
  var el = this.view.querySelector('.dropdownpanel')
  var caret = this.view.querySelector('.title').firstElementChild
  if (el.style.display === '') {
    el.style.display = 'none'
    caret.className = `${css.icon} fa fa-caret-right`
    this.event.trigger('hide', [])
  } else {
    el.style.display = ''
    caret.className = `${css.icon} fa fa-caret-down`
    this.event.trigger('show', [])
  }
}

DropdownPanel.prototype.hide = function () {
  if (this.view && !this.displayContentOnly) {
    var caret = this.view.querySelector('.title').firstElementChild
    var el = this.view.querySelector('.dropdownpanel')
    el.style.display = 'none'
    caret.className = `${css.icon} fa fa-caret-right`
    this.event.trigger('hide', [])
  }
}

DropdownPanel.prototype.show = function () {
  if (this.view && !this.displayContentOnly) {
    var caret = this.view.querySelector('.title').firstElementChild
    var el = this.view.querySelector('.dropdownpanel')
    el.style.display = ''
    caret.className = `${css.icon} fa fa-caret-down`
    this.event.trigger('show', [])
  }
}

DropdownPanel.prototype.message = function (message) {
  if (this.view) {
    var mes = this.view.querySelector('.dropdownpanel .message')
    mes.innerText = message
    mes.style.display = (message === '') ? 'none' : 'block'
  }
}

module.exports = DropdownPanel
