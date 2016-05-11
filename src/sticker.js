'use strict'
var React = require('react')

module.exports = React.createClass({
  getDefaultProps: function () {
    return {
      data: null
    }
  },

  render: function () {
    return (
      <div>
        <table>
          <tbody>
            {this.renderItems()}
          </tbody>
        </table>
      </div>
    )
  },

  renderItems: function () {
    if (this.props.data) {
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
    }
    return null
  }
})
