'use strict'
var React = require('react')
var BasicPanel = require('./basicPanel')

module.exports = React.createClass({
  contextTypes: {
    traceManager: React.PropTypes.object,
    tx: React.PropTypes.object,
    codeManager: React.PropTypes.object,
    root: React.PropTypes.object
  },

  getInitialState: function () {
    return {
      data: null
    }
  },

  render: function () {
    return (
      <BasicPanel name='Storage' data={this.state.data} />
    )
  },

  componentDidMount: function () {
    var self = this
    this.context.root.register('indexChanged', this, function (index) {
      if (index < 0) return
      if (window.ethDebuggerSelectedItem !== index) return

      self.context.traceManager.getStorageAt(index, self.context.tx, function (error, storage) {
        if (error) {
          console.log(error)
        } else if (window.ethDebuggerSelectedItem === index) {
          self.setState({
            data: self.formatStorage(storage)
          })
        }
      })
    })
  },

  formatStorage: function (storage) {
    var ret = ''
    for (var key in storage) {
      ret += key + '  ' + storage[key] + '\n'
    }
    return ret
  }
})
