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
        <button onClick={this.props.stepIntoBack} disabled={this.checkButtonState(-1)}>
          Step Into Back
        </button>
        <button onClick={this.props.stepOverBack} disabled={this.checkButtonState(-1)}>
          Step Over Back
        </button>
        <button onClick={this.props.stepOverForward} disabled={this.checkButtonState(1)}>
          Step Over Forward
        </button>
        <button onClick={this.props.stepIntoForward} disabled={this.checkButtonState(1)}>
          Step Into Forward
        </button>
        <button onClick={this.props.jumpNextCall} disabled={this.checkButtonState(1)}>
          Jump Next Call
        </button>
      </div>
    )
  },

  checkButtonState: function (incr) {
    if (!this.context.traceManager) {
      return false
    }
    var self = this
    this.context.traceManager.getLength(function (error, length) {
      if (error) {
        return false
      }
      if (incr === -1) {
        return self.props.step === 0 ? 'disabled' : ''
      } else if (incr === 1) {
        return self.props.step >= self.props.max - 1 ? 'disabled' : ''
      }
    })
  }
})
