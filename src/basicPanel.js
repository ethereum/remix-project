'use strict'
var React = require('react')
var style = require('./basicStyles')

module.exports = React.createClass({
  getDefaultProps: function () {
    return {
      data: null,
      name: null,
      renderRow: null
    }
  },

  render: function () {
    return (
      <div style={style.panel.container}>
        <div style={style.panel.title}>
          {this.props.name}
        </div>
        <div style={style.panel.tableContainer}>
          <table style={style.panel.table}>
            <tbody>
              {this.renderItems()}
            </tbody>
          </table>
        </div>
      </div>
    )
  },

  renderItems: function () {
    if (!this.props.data) {
      return []
    }
    if (!this.props.renderRow) {
      var ret = []
      for (var key in this.props.data) {
        ret.push(
          <tr key={key}>
            <td>
              {this.props.data[key]}
            </td>
          </tr>)
      }
      return ret
    } else {
      return this.props.renderRow(this.props.data)
    }
  }
})
