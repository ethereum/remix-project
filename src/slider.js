var React = require('react');
var style = require('./sliderStyles')

module.exports = React.createClass({
	
	propTypes: {
    	onChange: React.PropTypes.func.isRequired,
  	}, 
    
    getDefaultProps: function() 
	{
		return {
			min: 0,
			max: 500,
			step: 0
		};
	},

	render: function() {		
		return (
			<div>
                <input style={style.rule} type="range" value={this.props.step} min={this.props.min} max={this.props.max} onChange={this.onChange}  />               
			</div>
			);
	},
	
	onChange: function(event)
	{
		this.props.onChange(event.currentTarget.value)
	}
})
