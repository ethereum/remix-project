'use strict'
var React = require('react')
var BasicPanel = require('./basicPanel')

module.exports = React.createClass({
  contextTypes: {
    traceManager: React.PropTypes.object,
    tx: React.PropTypes.object
  },

  getDefaultProps: function () {
    return {
      currentStepIndex: -1
    }
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

  componentWillReceiveProps: function (nextProps) {
    if (nextProps.currentStepIndex < 0) return
    if (window.ethDebuggerSelectedItem !== nextProps.currentStepIndex) return

    var self = this
    this.context.traceManager.getStorageAt(nextProps.currentStepIndex, this.context.tx, function (error, storage) {
      if (error) {
        console.log(error)
      } else if (window.ethDebuggerSelectedItem === nextProps.currentStepIndex) {
        self.setState({
          data: self.formatStorage(storage)
        })
      }
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
