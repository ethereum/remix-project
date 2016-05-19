'use strict'
var React = require('react')
var style = require('./sliderStyles')

module.exports = React.createClass({
  contextTypes: {
    traceManager: React.PropTypes.object
  },

  propTypes: {
    onChange: React.PropTypes.func.isRequired
  },

  getDefaultProps: function () {
    return {
      min: 0,
      max: 1
    }
  },

  render: function () {
    return (
      <div>
        <input
          ref='rule'
          style={style.rule}
          type='range'
          min={this.props.min}
          max={this.props.max}
          onMouseUp={this.onMouseUp} />
      </div>
    )
  },

  componentDidMount: function () {
    this.setValue(0)
  },

  onMouseUp: function (event) {
    this.props.onChange(parseInt(this.refs.rule.value))
  },

  setValue: function (value) {
    var diff = value - this.refs.rule.value
    if (diff > 0) {
      this.refs.rule.stepUp(diff)
    } else {
      this.refs.rule.stepDown(Math.abs(diff))
    }
  }
})
