var React = require('react');
var BasicPanel = require('./basicPanel');
var style = require('./basicStyles')

module.exports = React.createClass({

	getInitialState: function()
	{
		return {
			currentSelected: 0,
			currentAddress: null,
			currentStack: null,
			currentLevels: null,
			currentStorage: null,
			currentMemory: null,
			currentCallData: null,
			selectedInst: 0,
			lastLevels: null,
			lastStorage: null,
			lastMemory: null,
			lastCallData: null
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
		return (
			<div style={this.props.vmTrace === null ? style.hidden : style.display} >
			<div style={style.container}>
			<button onClick={this.stepIntoBack} disabled={ this.checkButtonState(-1) } >stepIntoBack</button>
			<button onClick={this.stepOverBack} disabled={ this.checkButtonState(-1) } >stepOverBack</button>
			<button onClick={this.stepOverForward} disabled={ this.checkButtonState(1) } >stepOverForward</button>
			<button onClick={this.stepIntoForward} disabled={ this.checkButtonState(1) } >stepIntoForward</button>
			</div>
			<div style={style.container}>
			<select size="10" ref='itemsList' value={this.state.selectedInst}>
			{ this.renderAssemblyItems() }
			</select>
			</div>
			<div>
			<BasicPanel name="Stack" data={this.state.currentStack} />
			<BasicPanel name="CallStack" data={this.state.currentCallStack} />
			<BasicPanel name="Storage" data={this.state.currentStorage} />
			<BasicPanel name="Memory" data={this.state.currentMemory} />
			<BasicPanel name="CallData" data={this.state.currentCallData} />
			</div>
			</div>
			);
	},

	checkButtonState: function(incr)
	{
		if (!this.props.vmTrace)
			return "disabled"
		if (incr === -1)
			return this.state.currentSelected === 0 ? "disabled" : ""
		else if (incr === 1)
			return this.state.currentSelected >= this.props.vmTrace.vmtrace.length - 1 ? "disabled" : "" 
	},

	renderAssemblyItems: function()
	{
		if (this.props.vmTrace && this.props.vmTrace.vmtrace)
		{      
			return this.props.vmTrace.vmtrace.map(function(item, i) 
			{
				return <option key={i} value={i} >{i} {item.instname}</option>;
			});	
		}
	},

	componentWillReceiveProps: function (nextProps) {
		this.updateState(nextProps, 0)
	},

	updateState: function(props, vmTraceIndex)
	{
		var previousState = this.state.currentSelected 
		this.setState({ currentSelected: vmTraceIndex })
		this.state.currentAddress = props.vmTrace.vmtrace[0].address
		this.state.selectedInst = props.vmTrace.codesmap[this.state.currentAddress][props.vmTrace.vmtrace[vmTraceIndex].pc]

		if (props.vmTrace.vmtrace[vmTraceIndex].stack)
		{
			var stack = props.vmTrace.vmtrace[vmTraceIndex].stack
			stack.reverse()	
			this.setState({ currentStack: stack })
		}

		if (props.vmTrace.vmtrace[vmTraceIndex].levels)
		{
			var levels = props.vmTrace.vmtrace[vmTraceIndex].levels
			var callStack = []
			for (var k in levels)
				callStack.push(props.vmTrace.vmtrace[levels[k]].address)			
			this.setState({ currentCallStack: callStack })
			lastCallStack = callStack
		}

		var storageIndex = vmTraceIndex
		if (vmTraceIndex < previousState)
			storageIndex = this.retrieveLastSeenProperty(vmTraceIndex, "storage", props.vmTrace.vmtrace)
		if (props.vmTrace.vmtrace[storageIndex].storage || storageIndex === 0)
		{
			this.setState({ currentStorage: props.vmTrace.vmtrace[storageIndex].storage })
			lastStorage = props.vmTrace.vmtrace[storageIndex].storage
		}

		var memoryIndex = vmTraceIndex
		if (vmTraceIndex < previousState)
			memoryIndex = this.retrieveLastSeenProperty(vmTraceIndex, "memory", props.vmTrace.vmtrace)	
		if (props.vmTrace.vmtrace[memoryIndex].memory || memoryIndex === 0)
		{
			this.setState({ currentMemory: this.formatMemory(props.vmTrace.vmtrace[memoryIndex].memory) })
			lastMemory = this.formatMemory(props.vmTrace.vmtrace[memoryIndex].memory)
		}

		if (props.vmTrace.vmtrace[vmTraceIndex].calldata)
		{
			this.setState({ currentCallData: props.vmTrace.vmtrace[vmTraceIndex].calldata })
			lastCallData = props.vmTrace.vmtrace[vmTraceIndex].calldata
		}
	},

	retrieveLastSeenProperty: function(currentIndex, propertyName, vmTrace)
	{
		var index = currentIndex
		while (index > 0)
		{
			if (vmTrace[index][propertyName])
				break
			index--
		}
		return index	
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
		while (--i >= 0) 
		{
			if (this.isCallInstruction(i))
			{
				if (depth == 0)
					break;
				else
					depth--;
			}
			else if (this.isReturnInstruction(i))
					depth++;
			
		}
		this.selectState(i);
	},

	stepOutForward: function()
	{
		var i = this.state.currentSelected
		var depth = 0
		while (++i < this.props.vmTrace.vmtrace.length) 
		{
			if (this.isReturnInstruction(i))
			{
				if (depth == 0)
					break
				else
					depth--
			}
			else if (this.isCallInstruction(i))
				depth++
		}
		this.selectState(i + 1);
	},

	moveSelection: function(incr)
	{
		this.selectState(this.state.currentSelected + incr)
	},

	selectState: function(index)
	{
		var selectedInst = this.props.vmTrace.codesmap[this.state.currentAddress][this.props.vmTrace.vmtrace[index].pc]
		this.updateState(this.props, index)
		this.refs.itemsList.value = selectedInst
		if (this.props.vmTrace.vmtrace[index].address && this.state.currentAddress !== this.props.vmTrace.vmtrace[index].address)
			this.state.currentAddress = this.props.vmTrace.vmtrace[index].address
	},

	formatMemory: function(mem, width)
	{
		var ret = []
		for (var k = 0; k < mem.length; k += (width * 2))
		{
			var memory = mem.substr(k, width * 2)
			ret.push({
				address: web3.toHex(k),
				content: this.tryAsciiFormat(memory)
			})
		}
		return ret
	},

	tryAsciiFormat: function(memorySlot)
	{
		var ret = { ascii: "", raw: "" }
		for (var k = 0; k < memorySlot.length; k += 2)
		{
			var raw = memorySlot.substr(k, 2)
			var dec = web3.toDecimal("0x" + raw)
			if (dec >= 32 && dec < 127)
				ret.ascii += web3.toAscii(raw)
			else
				ret.ascii += "?"
			ret.raw += " " + raw
		}
		return ret
	}
})
