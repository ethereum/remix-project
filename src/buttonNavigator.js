'use strict'
var React = require('react')

module.exports = React.createClass({
  contextTypes: {
    traceManager: React.PropTypes.object
  },

  propTypes: {
    stepIntoBack: React.PropTypes.func.isRequired,
    stepIntoForward: React.PropTypes.func.isRequired,
    stepOverBack: React.PropTypes.func.isRequired,
    stepOverForward: React.PropTypes.func.isRequired,
    jumpNextCall: React.PropTypes.func.isRequired
  },

  render: function () {
    return (
      <div>
        <button ref='intoback' onClick={this.props.stepIntoBack}>
          Step Into Back
        </button>
        <button ref='overback' onClick={this.props.stepOverBack}>
          Step Over Back
        </button>
        <button ref='overforward' onClick={this.props.stepOverForward}>
          Step Over Forward
        </button>
        <button ref='intoforward' onClick={this.props.stepIntoForward}>
          Step Into Forward
        </button>
        <button ref='nextcall' onClick={this.props.jumpNextCall}>
          Jump Next Call
        </button>
      </div>
    )
  },

  shouldComponentUpdate: function () {
    return false
  },

  stepChanged: function (step) {
    this.refs.intoback.disabled = step <= 0
    this.refs.overback.disabled = step <= 0
    if (!this.context.traceManager) {
      this.refs.intoforward.disabled = true
      this.refs.overforward.disabled = true
      this.refs.nextcall.disabled = true
    } else {
      var self = this
      this.context.traceManager.getLength(function (error, length) {
        if (error) {
          console.log(error)
        } else {
          self.refs.intoforward.disabled = step >= length - 1
          self.refs.overforward.disabled = step >= length - 1
          self.refs.nextcall.disabled = step >= length - 1
        }
      })
    }
  }
})
