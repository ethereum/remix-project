'use strict'
var React = require('react')
var ButtonNavigator = require('./buttonNavigator')
var Slider = require('./slider')
var style = require('./basicStyles')

module.exports = React.createClass({
  propTypes: {
    onStepChanged: React.PropTypes.func.isRequired
  },

  contextTypes: {
    traceManager: React.PropTypes.object
  },

  getInitialState: function () {
    return {
      currentStepIndex: 0,
      traceLength: 0
    }
  },

  render: function () {
    return (
      <div style={style.container}>
        <Slider
          ref='slider'
          onChange={this.sliderMoved}
          min='0'
          max={this.state.traceLength} />
        <ButtonNavigator
          stepIntoBack={this.stepIntoBack}
          stepIntoForward={this.stepIntoForward}
          stepOverBack={this.stepOverBack}
          stepOverForward={this.stepOverForward}
          jumpNextCall={this.jumpToNextCall}
          max={this.state.traceLength} />
      </div>
    )
  },

  componentDidMount: function () {
    this.updateGlobalSelectedItem(0)
  },

  updateGlobalSelectedItem: function (value) {
    window.ethDebuggerSelectedItem = value
  },

  init: function () {
    this.refs.slider.setValue(0)
  },

  newTraceAvailable: function () {
    this.init()
    var self = this
    this.context.traceManager.getLength(function (error, length) {
      if (error) {
        console.log(error)
      } else {
        self.setState({ traceLength: length })
      }
    })
  },

  sliderMoved: function (step) {
    this.props.onStepChanged(step)
    this.changeState(step)
  },

  stepIntoForward: function () {
    var step = this.state.currentStepIndex + 1
    this.props.onStepChanged(step)
    this.changeState(step)
  },

  stepIntoBack: function () {
    var step = this.state.currentStepIndex - 1
    this.props.onStepChanged(step)
    this.refs.slider.setValue(step)
    this.changeState(step)
  },

  stepOverForward: function () {
    var step = this.context.traceManager.findStepOverForward(this.state.currentStepIndex)
    this.props.onStepChanged(step)
    this.refs.slider.setValue(step)
    this.changeState(step)
  },

  stepOverBack: function () {
    var step = this.context.traceManager.findStepOverBack(this.state.currentStepIndex)
    this.props.onStepChanged(step)
    this.refs.slider.setValue(step)
    this.changeState(step)
  },

  jumpToNextCall: function () {
    var step = this.context.traceManager.findNextCall(this.state.currentStepIndex)
    this.props.onStepChanged(step)
    this.refs.slider.setValue(step)
    this.changeState(step)
  },

  changeState: function (step) {
    this.updateGlobalSelectedItem(step)
    this.setState({
      currentStepIndex: step
    })
  }
})
