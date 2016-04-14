var React = require('react');

module.exports = React.createClass({

	getInitialState: function()
	{
		return {
			currentSelected: null,
			currentAddress: null
		};
	},

	getDefaultProps: function() 
	{
		return {
			vmTrace: null
		};
	},	

	render: function() 
	{		
		if (!this.props.vmTrace || !this.props.vmTrace.vmtrace || this.props.vmTrace.vmtrace.length === 0)
			return null;
		this.state.currentAddress = this.props.vmTrace.vmtrace[0].address
		this.state.currentSelected = this.props.vmTrace.codesmap[this.state.currentAddress][this.props.vmTrace.vmtrace[0].pc]
		return (
			<div>
			<div id="action" >
			<button onClick={this.stepIntoBack} >stepIntoBack</button>
			<button onClick={this.stepOverBack} >stepOverBack</button>
			<button onClick={this.stepOverForward} >stepOverForward</button>
			<button onClick={this.stepIntoForward} >stepIntoForward</button>
			</div>
			<div>
			<select size="10" ref='itemsList' value={this.state.currentSelected}>
			{ this.renderAssemblyItems() }
			</select>
			</div>
			</div>
			);
	},

	renderAssemblyItems: function()
	{
		if (this.props.vmTrace)
		{      
			var selectedItem = this.state.currentSelected
			return this.props.vmTrace.vmtrace.map(function(item, i) 
			{
				return <option key={i} value={i} >{item.instname}</option>;
			});	
		}
	},

	
	stepIntoBack: function ()
	{
		this.moveSelection(-1)
	},

	stepOverBack: function()
	{
		if (this.isReturnInstruction(this.state.currentSelected - 1))
			this.stepOutBack();
		else
			this.moveSelection(-1);
	},

	stepOverForward: function()
	{
		if (this.isCallInstruction(this.state.currentSelected))
			this.stepOutForward();
		else
			this.moveSelection(1);
	},

	stepIntoForward: function()
	{
		this.moveSelection(1)
	},

	stepOverBack: function()
	{
		if (this.isReturnInstruction(this.state.currentSelected - 1))
			this.stepOutBack();
		else
			this.moveSelection(-1);
	},

	stepOverForward: function()
	{
		if (this.isCallInstruction(this.state.currentSelected))
			this.stepOutForward();
		else
			this.moveSelection(1);
	},

	isCallInstruction: function(index)
	{
		var state = this.props.vmTrace.vmtrace[index];
		return state.instname === "CALL" || state.instname === "CREATE";
	},

	isReturnInstruction: function(index)
	{
		var state = this.props.vmTrace.vmtrace[index];
		return state.instname === "RETURN"
	},

	stepOutBack: function()
	{
		var i = this.state.currentSelected - 1;
		var depth = 0;
		while (--i >= 0) {
			if (this.isCallInstruction(i))
				if (depth == 0)
					break;
				else depth--;
				else if (this.isReturnInstruction(i))
					depth++;
			}
			this.selectState(i);
		},

		stepOutForward: function()
		{
			var i = this.state.currentSelected;
			var depth = 0;
			while (++i < this.props.vmTrace.vmtrace.length) {
				if (this.isReturnInstruction(i))
					if (depth == 0)
						break;
					else
						depth--;
					else if (this.isCallInstruction(i))
						depth++;
				}
				this.selectState(i + 1);
			},

			moveSelection: function(incr)
			{
				this.selectState(this.state.currentSelected + incr)
			},

			selectState: function(index)
			{
				var newIndex = this.props.vmTrace.codesmap[this.state.currentAddress][this.props.vmTrace.vmtrace[index].pc]
				this.state.currentSelected = index
				this.refs.itemsList.value = this.state.currentSelected
				if (this.props.vmTrace.vmtrace[index].address && this.state.currentAddress !== this.props.vmTrace.vmtrace[index].address)
					this.state.currentAddress = this.props.vmTrace.vmtrace[index].address
			},
		})
