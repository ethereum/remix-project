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
      <BasicPanel name='Stack' data={this.state.data} />
    )
  },

  componentDidMount: function () {
    var self = this
    this.context.root.register('indexChanged', this, function (index) {
      if (index < 0) return
      if (self.context.root.ethDebuggerSelectedItem !== index) return

      self.context.traceManager.getStackAt(index, function (error, stack) {
        if (error) {
          console.log(error)
        } else if (self.context.root.ethDebuggerSelectedItem === index) {
          self.setState({
            data: self.format(stack)
          })
        }
      })
    })
  },

  format: function (stack) {
    var ret = ''
    for (var key in stack) {
      ret += stack[key] + '\n'
    }
    return ret
  }
})
