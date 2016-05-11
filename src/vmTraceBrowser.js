'use strict'
var React = require('react')
var AssemblyItemsBrowser = require('./assemblyItemsBrowser')

module.exports = React.createClass({
  render: function () {
    return (
      <div>
        <AssemblyItemsBrowser vmTrace={this.props.vmTrace} />
      </div>
    )
  }
})
