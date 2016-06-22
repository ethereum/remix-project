'use strict'
var React = require('react')
var BasicPanel = require('./basicPanel')
var util = require('./helpers/ui')

module.exports = React.createClass({
  contextTypes: {
    traceManager: React.PropTypes.object,
    web3: React.PropTypes.object,
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
      <BasicPanel name='Memory' data={this.state.data} />
    )
  },

  componentDidMount: function () {
    var self = this
    this.context.root.register('indexChanged', this, function (index) {
      if (index < 0) return
      if (self.context.root.ethDebuggerSelectedItem !== index) return

      self.context.traceManager.getMemoryAt(index, function (error, memory) {
        if (error) {
          console.log(error)
        } else if (self.context.root.ethDebuggerSelectedItem === index) {
          self.setState({
            data: util.formatMemory(memory, 16)
          })
        }
      })
    })
  }
})
