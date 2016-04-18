var React = require('react');
var style = require('./basicStyles')

module.exports = React.createClass({

	getDefaultProps: function() 
	{
		return {
			data: null,
			name: null
		};
	},

	render: function() 
	{		
		return (
			<div style={style.panel.container}>
			<div style={style.panel.title} >{this.props.name}</div>
			<table style={style.panel.table}>
			<tbody>
			{ this.renderItems() }
			</tbody>
			</table>
			</div>
			);
	},
	
	renderItems: function()
	{
		var ret = []
		if (this.props.data)
		{	
			for (var key in this.props.data)
				ret.push(<tr key={key} ><td>{JSON.stringify(this.props.data[key])}</td></tr>)
		}
		return ret
	}	
})
