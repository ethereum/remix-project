'use strict'
var React = require('react')
var BasicPanel = require('./basicPanel')

module.exports = React.createClass({
  contextTypes: {
    traceManager: React.PropTypes.object,
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
      <BasicPanel name='CallStack' data={this.state.data} />
    )
  },

  componentDidMount: function () {
    var self = this
    this.context.root.register('indexChanged', this, function (index) {
      if (index < 0) return
      if (window.ethDebuggerSelectedItem !== index) return

      self.context.traceManager.getCallStackAt(index, function (error, callstack) {
        if (error) {
          console.log(error)
        } else if (window.ethDebuggerSelectedItem === index) {
          self.setState({
            data: self.format(callstack)
          })
        }
      })
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
