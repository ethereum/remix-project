'use strict'
var React = require('react')
var style = require('./basicStyles')

module.exports = React.createClass({
  getDefaultProps: function () {
    return {
      data: null,
      name: null
    }
  },

  render: function () {
    return (
      <div style={style.panel.container}>
        <div style={style.panel.title}>
          {this.props.name}
        </div>
        <div style={style.panel.tableContainer}>
          <pre style={Object.assign(style.panel.table, style.font)} >{this.props.data}</pre>
        </div>
      </div>
    )
  }
})
