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
      <BasicPanel name='CallStack' data={this.state.data} />
    )
  },

  componentWillReceiveProps: function (nextProps) {
    if (nextProps.currentStepIndex < 0) return
    if (window.ethDebuggerSelectedItem !== nextProps.currentStepIndex) return

    var self = this
    this.context.traceManager.getCallStackAt(nextProps.currentStepIndex, function (error, callstack) {
      if (error) {
        console.log(error)
      } else if (window.ethDebuggerSelectedItem === nextProps.currentStepIndex) {
        self.setState({
          data: self.format(callstack)
        })
      }
    })
  },

  format: function (callstack) {
    var ret = ''
    for (var key in callstack) {
      ret += callstack[key] + '\n'
    }
    return ret
  }
})
