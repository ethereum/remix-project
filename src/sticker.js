'use strict'
var React = require('react')

module.exports = React.createClass({
  contextTypes: {
    traceManager: React.PropTypes.object,
    codeManager: React.PropTypes.object,
    root: React.PropTypes.object
  },

  getInitialState: function () {
    return {
      vmTraceStep: '',
      step: '',
      addmemory: '',
      gas: '',
      remainingGas: ''
    }
  },

  render: function () {
    return (
      <div>
        <table>
          <tbody>
            <tr key='vmtracestep'>
              <td>
                vmtracestep
              </td>
              <td>
                {this.state.vmTraceStep}
              </td>
            </tr>
            <tr key='step'>
              <td>
                step
              </td>
              <td>
                {this.state.step}
              </td>
            </tr>
            <tr key='addmemory'>
              <td>
                add memory
              </td>
              <td>
                {this.state.addmemory}
              </td>
            </tr>
            <tr key='gas'>
              <td>
                gas
              </td>
              <td>
                {this.state.gas}
              </td>
            </tr>
            <tr key='remaininggas'>
              <td>
                remaining gas
              </td>
              <td>
                {this.state.remainingGas}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    )
  },

  renderItems: function () {
    if (this.state.data) {
      var ret = []
      for (var key in this.state.data) {
        ret.push(
          <tr key={key}>
            <td>
              {this.props.data[key]}
            </td>
          </tr>)
      }
      return ret
    }
    return null
  },

  componentDidMount: function () {
    var self = this
    this.context.root.register('indexChanged', this, function (index) {
      if (index < 0) return

      self.setState({
        vmTraceStep: index
      })

      self.context.traceManager.getCurrentStep(index, function (error, step) {
        if (error) {
          console.log(error)
        } else {
          self.setState({
            step: step
          })
        }
      })

      self.context.traceManager.getMemExpand(index, function (error, addmem) {
        if (error) {
          console.log(error)
        } else {
          self.setState({
            addmemory: addmem
          })
        }
      })

      self.context.traceManager.getStepCost(index, function (error, gas) {
        if (error) {
          console.log(error)
        } else {
          self.setState({
            gas: gas
          })
        }
      })

      self.context.traceManager.getRemainingGas(index, function (error, remaingas) {
        if (error) {
          console.log(error)
        } else {
          self.setState({
            remainingGas: remaingas
          })
        }
      })
    })
  }
})
