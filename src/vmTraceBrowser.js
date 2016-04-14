var React = require('react');
var AssemblyItemsBrowser = require('./assemblyItemsBrowser');

module.exports = React.createClass({
  	render: function() {
  		return ( <AssemblyItemsBrowser vmTrace={this.props.vmTrace} /> )
	}
});
