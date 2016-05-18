'use strict'
var React = require('react')
var style = require('./basicStyles')

module.exports = React.createClass({
  contextTypes: {
    web3: React.PropTypes.object
  },

  propTypes: {
    onNewTxRequested: React.PropTypes.func.isRequired
  },

  getInitialState: function () {
    return {blockNumber: '1382256', txNumber: '1', from: '', to: '', hash: ''}
  },

  submit: function () {
    var tx = this.context.web3.eth.getTransactionFromBlock(this.state.blockNumber, this.state.txNumber)
    if (tx) {
      this.setState({from: tx.from, to: tx.to, hash: tx.hash})
    }
    this.props.onNewTxRequested(this.state.blockNumber, parseInt(this.state.txNumber))
  },

  updateBlockN: function (ev) {
    this.state.blockNumber = ev.target.value
  },

  updateTxN: function (ev) {
    this.state.txNumber = ev.target.value
  },

  render: function () {
    return (
      <div style={style.container}>
        <input onChange={this.updateBlockN} type='text' placeholder={'Block number or hash (default 1382256)' + this.state.blockNumber}></input>
        <input onChange={this.updateTxN} type='text' placeholder={'Transaction Number (default 1) ' + this.state.txNumber}></input>
        <button onClick={this.submit}>
          Get
        </button>
        <div style={style.transactionInfo}>
          <div>
            Hash:
            {this.state.hash}
          </div>
          <div>
            From:
            {this.state.from}
          </div>
          <div>
            To:
            {this.state.to}
          </div>
        </div>
      </div>
    )
  }
})
