'use strict'
var React = require('react')
var BasicPanel = require('./basicPanel')

module.exports = React.createClass({
  contextTypes: {
    traceManager: React.PropTypes.object
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
      <BasicPanel name='CallData' data={this.state.data} />
    )
  },

  componentWillReceiveProps: function (nextProps) {
    if (nextProps.currentStepIndex < 0) return
    if (window.ethDebuggerSelectedItem !== nextProps.currentStepIndex) return

    var self = this
    this.context.traceManager.getCallDataAt(nextProps.currentStepIndex, function (error, calldata) {
      if (error) {
        console.log(error)
      } else if (window.ethDebuggerSelectedItem === nextProps.currentStepIndex) {
        self.setState({
          data: self.format(calldata)
        })
      }
    })
  },

  format: function (calldata) {
    var ret = ''
    for (var key in calldata) {
      ret += calldata[key] + '\n'
    }
    return ret
  }
})
