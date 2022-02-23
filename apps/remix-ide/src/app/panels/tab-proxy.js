import React from 'react' // eslint-disable-line
import { Plugin } from '@remixproject/engine'
import { TabsUI } from '@remix-ui/tabs'
import { PluginViewWrapper, getPathIcon } from '@remix-ui/helper'
const EventEmitter = require('events')

const profile = {
  name: 'tabs',
  methods: ['focus'],
  kind: 'other'
}

export class TabProxy extends Plugin {
  constructor (fileManager, editor) {
    super(profile)
    this.event = new EventEmitter()
    this.fileManager = fileManager
    this.editor = editor
    this.data = {}
    this._view = {}
    this._handlers = {}
    this.loadedTabs = []
    this.el = document.createElement('div')
    this.dispatch = null
  }

  onActivation () {
    this.on('theme', 'themeChanged', (theme) => {
      // update invert for all icons
      this.updateImgStyles()
    })

    this.on('fileManager', 'filesAllClosed', () => {
      this.call('manager', 'activatePlugin', 'home')
      this.tabsApi.activateTab('home')
    })

    this.on('fileManager', 'fileRemoved', (name) => {
      const workspace = this.fileManager.currentWorkspace()

      if (this.fileManager.mode === 'browser') {
        name = name.startsWith(workspace + '/') ? name : workspace + '/' + name
        this.removeTab(name)
      } else {
        name = name.startsWith(this.fileManager.mode + '/') ? name : this.fileManager.mode + '/' + name
        this.removeTab(name)
      }
    })

    this.on('fileManager', 'fileClosed', (name) => {
      const workspace = this.fileManager.currentWorkspace()

      if (this.fileManager.mode === 'browser') {
        name = name.startsWith(workspace + '/') ? name : workspace + '/' + name
        this.removeTab(name)
      } else {
        name = name.startsWith(this.fileManager.mode + '/') ? name : this.fileManager.mode + '/' + name
        this.removeTab(name)
      }
    })

    this.on('fileManager', 'currentFileChanged', (file) => {
      const workspace = this.fileManager.currentWorkspace()

      if (this.fileManager.mode === 'browser') {
        const workspacePath = workspace + '/' + file

        if (this._handlers[workspacePath]) {
          this.tabsApi.activateTab(workspacePath)
          return
        }
        this.addTab(workspacePath, '', async () => {
          await this.fileManager.open(file)
          this.event.emit('openFile', file)
          this.emit('openFile', file)
        },
        async () => {
          await this.fileManager.closeFile(file)
          this.event.emit('closeFile', file)
          this.emit('closeFile', file)
        })
        this.tabsApi.activateTab(workspacePath)
      } else {
        const path = file.startsWith(this.fileManager.mode + '/') ? file : this.fileManager.mode + '/' + file

        if (this._handlers[path]) {
          this.tabsApi.activateTab(path)
          return
        }
        this.addTab(path, '', async () => {
          await this.fileManager.open(file)
          this.event.emit('openFile', file)
          this.emit('openFile', file)
        },
        async () => {
          await this.fileManager.closeFile(file)
          this.event.emit('closeFile', file)
          this.emit('closeFile', file)
        })
        this.tabsApi.activateTab(path)
      }
    })

    this.on('fileManager', 'fileRenamed', (oldName, newName, isFolder) => {
      const workspace = this.fileManager.currentWorkspace()

      if (this.fileManager.mode === 'browser') {
        if (isFolder) {
          for (const tab of this.loadedTabs) {
            if (tab.name.indexOf(workspace + '/' + oldName + '/') === 0) {
              const newTabName = workspace + '/' + newName + tab.name.slice(workspace + '/' + oldName.length, tab.name.length)
              this.renameTab(tab.name, newTabName)
            }
          }
          return
        }
        // should change the tab title too
        this.renameTab(workspace + '/' + oldName, workspace + '/' + newName)
      } else {
        if (isFolder) {
          for (const tab of this.loadedTabs) {
            if (tab.name.indexOf(this.fileManager.mode + '/' + oldName + '/') === 0) {
              const newTabName = this.fileManager.mode + '/' + newName + tab.name.slice(this.fileManager.mode + '/' + oldName.length, tab.name.length)
              this.renameTab(tab.name, newTabName)
            }
          }
          return
        }
        // should change the tab title too
        this.renameTab(this.fileManager.mode + '/' + oldName, this.fileManager.mode + '/' + newName)
      }
    })

    this.on('manager', 'pluginActivated', ({ name, location, displayName, icon }) => {
      if (location === 'mainPanel') {
        this.addTab(
          name,
          displayName,
          () => this.emit('switchApp', name),
          () => {
            this.emit('closeApp', name)
            this.call('manager', 'deactivatePlugin', name)
          },
          icon
        )
        this.switchTab(name)
      }
    })

    this.on('manager', 'pluginDeactivated', (profile) => {
      this.removeTab(profile.name)
    })
  }

  focus (name) {
    this.emit('switchApp', name)
    this.tabsApi.activateTab(name)
  }

  updateImgStyles () {
    const images = this.el.getElementsByClassName('iconImage')
    for (const element of images) {
      this.call('theme', 'fixInvert', element)
    }
  }

  switchTab (tabName) {
    if (this._handlers[tabName]) {
      this._handlers[tabName].switchTo()
      this.tabsApi.activateTab(tabName)
    }
  }

  switchNextTab () {
    const active = this.tabsApi.active()
    if (active && this._handlers[active]) {
      const handlers = Object.keys(this._handlers)
      let i = handlers.indexOf(active)
      if (i >= 0) {
        i = handlers[i + 1] ? i + 1 : 0
        this.switchTab(handlers[i])
      }
    }
  }

  switchPreviousTab () {
    const active = this.tabsApi.active()
    if (active && this._handlers[active]) {
      const handlers = Object.keys(this._handlers)
      let i = handlers.indexOf(active)
      if (i >= 0) {
        i = handlers[i - 1] ? i - 1 : handlers.length - 1
        this.switchTab(handlers[i])
      }
    }
  }

  renameTab (oldName, newName) {
    this.addTab(newName, '', async () => {
      await this.fileManager.open(newName)
      this.event.emit('openFile', newName)
    },
    async () => {
      await this.fileManager.closeFile(newName)
      this.event.emit('closeFile', newName)
      this.emit('closeFile', newName)
    })
    this.removeTab(oldName)
  }

  addTab (name, title, switchTo, close, icon) {
    if (this._handlers[name]) return this.renderComponent()

    var slash = name.split('/')
    const tabPath = slash.reverse()
    const tempTitle = []

    if (!title) {
      for (let i = 0; i < tabPath.length; i++) {
        tempTitle.push(tabPath[i])
        const formatPath = [...tempTitle].reverse()
        const index = this.loadedTabs.findIndex(({ title }) => title === formatPath.join('/'))

        if (index === -1) {
          title = formatPath.join('/')
          const titleLength = formatPath.length
          this.loadedTabs.push({
            id: name,
            name,
            title,
            icon,
            tooltip: name,
            iconClass: getPathIcon(name)
          })
          formatPath.shift()
          if (formatPath.length > 0) {
            const index = this.loadedTabs.findIndex(({ title }) => title === formatPath.join('/'))
            if (index > -1) {
              const duplicateTabName = this.loadedTabs[index].name
              const duplicateTabPath = duplicateTabName.split('/')
              const duplicateTabFormatPath = [...duplicateTabPath].reverse()
              const duplicateTabTitle = duplicateTabFormatPath.slice(0, titleLength).reverse().join('/')
              this.loadedTabs[index] = {
                id: duplicateTabName,
                name: duplicateTabName,
                title: duplicateTabTitle,
                icon,
                tooltip: duplicateTabName,
                iconClass: getPathIcon(duplicateTabName)
              }
            }
          }
          break
        }
      }
    } else {
      this.loadedTabs.push({
        id: name,
        name,
        title,
        icon,
        tooltip: name,
        iconClass: getPathIcon(name)
      })
    }

    this.renderComponent()
    this.updateImgStyles()
    this._handlers[name] = { switchTo, close }
  }

  removeTab (name) {
    delete this._handlers[name]
    let previous = null
    this.loadedTabs = this.loadedTabs.filter((tab, index) => {
      if (tab.name === name) previous = this.loadedTabs[index - 1]
      return tab.name !== name
    })
    this.renderComponent()
    this.updateImgStyles()
    if (previous) this.switchTab(previous.name)
  }

  addHandler (type, fn) {
    this.handlers[type] = fn
  }

  setDispatch (dispatch) {
    this.dispatch = dispatch
    this.renderComponent()
  }

  updateComponent(state) {
    return <TabsUI tabs={state.loadedTabs} onSelect={state.onSelect} onClose={state.onClose} onZoomIn={state.onZoomIn} onZoomOut={state.onZoomOut} onReady={state.onReady} />
  }

  renderComponent () {
    const onSelect = (index) => {
      if (this.loadedTabs[index]) {
        const name = this.loadedTabs[index].name
        if (this._handlers[name]) this._handlers[name].switchTo()
        this.emit('tabCountChanged', this.loadedTabs.length)
      }
    }

    const onClose = (index) => {
      if (this.loadedTabs[index]) {
        const name = this.loadedTabs[index].name
        if (this._handlers[name]) this._handlers[name].close()
        this.emit('tabCountChanged', this.loadedTabs.length)
      }
    }

    const onZoomIn = () => this.editor.editorFontSize(1)
    const onZoomOut = () => this.editor.editorFontSize(-1)

    const onReady = (api) => { this.tabsApi = api }

    this.dispatch({
      loadedTabs: this.loadedTabs,
      onSelect,
      onClose,
      onZoomIn,
      onZoomOut,
      onReady
    })
  }

  renderTabsbar () {
    return <div><PluginViewWrapper plugin={this} /></div>
  }
}
