'use strict'
var React = require('react')
var style = require('./basicStyles')

module.exports = React.createClass({
  contextTypes: {
    codeManager: React.PropTypes.object
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
    this.context.codeManager.registerIndexChangedListener(this, this.indexChanged)
    this.context.codeManager.registerCodeChangedListener(this, this.codeChanged)
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
