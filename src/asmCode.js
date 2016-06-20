'use strict'
var React = require('react')
var style = require('./basicStyles')

module.exports = React.createClass({
  contextTypes: {
    codeManager: React.PropTypes.object,
    root: React.PropTypes.object,
    tx: React.PropTypes.object
  },

  getInitialState: function () {
    return {
      code: '',
      address: ''
    }
  },

  render: function () {
    return (
      <select size='10' ref='itemsList' style={style.instructionsList}>
        {this.renderAssemblyItems()}
      </select>
    )
  },

  componentDidMount: function () {
    var self = this
    this.context.codeManager.register('indexChanged', this, this.indexChanged)
    this.context.codeManager.register('codeChanged', this, this.codeChanged)
    this.context.codeManager.register('loadingCode', this, function (address) {
    })
    this.context.root.register('indexChanged', this, function (index) {
      self.context.codeManager.resolveStep(index, self.context.tx)
    })
  },

  indexChanged: function (index) {
    this.refs.itemsList.value = index
  },

  codeChanged: function (code, address, index) {
    this.setState({
      code: code,
      address: address
    })
    this.refs.itemsList.value = index
  },

  shouldComponentUpdate: function (nextProps, nextState) {
    if (nextState.address === this.state.address) {
      return false
    }
    return true
  },

  renderAssemblyItems: function () {
    if (this.state && this.state.code) {
      return this.state.code.map(function (item, i) {
        return <option key={i} value={i}>{item}</option>
      })
    }
  }
})
