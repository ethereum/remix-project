var React = require('react');
var BasicPanel = require('./basicPanel')
var codeUtils = require('./codeUtils')
var style = require('./basicStyles')

module.exports = React.createClass({

	getInitialState: function()
	{
		return {
			currentSelected: 0, // current selected item in the vmTrace
			selectedInst: 0, // current selected item in the contract assembly code
			currentAddress: null,
			currentStack: null,
			currentLevels: null,
			currentStorage: null,
			currentMemory: null,
			currentCallData: null,
			lastLevels: null,
			lastStorage: null,
			lastMemory: null,
			lastCallData: null,
			codes: {},
			codesMap: {}
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
			<div style={style.container}><span style={style.address}>{this.state.currentAddress}</span></div> 
			<div style={style.container}>
			<button onClick={this.stepIntoBack} disabled={ this.checkButtonState(-1) } >stepIntoBack</button>
			<button onClick={this.stepOverBack} disabled={ this.checkButtonState(-1) } >stepOverBack</button>
			<button onClick={this.stepOverForward} disabled={ this.checkButtonState(1) } >stepOverForward</button>
			<button onClick={this.stepIntoForward} disabled={ this.checkButtonState(1) } >stepIntoForward</button>
			</div>
			<div style={style.container}>
			<select size="10" ref='itemsList' style={style.container} value={this.state.selectedInst}>
			{ this.renderAssemblyItems() }
			</select>
			</div>
			<div>
			<BasicPanel name="Stack" data={this.state.currentStack} />
			<BasicPanel name="CallStack" data={this.state.currentCallStack} />
			<BasicPanel name="Storage" data={this.state.currentStorage} />
			<BasicPanel name="Memory" data={this.state.currentMemory} renderRow={this.renderMemoryRow} />
			<BasicPanel name="CallData" data={this.state.currentCallData} />
			</div>
			</div>
			);
	},

	renderMemoryRow: function(data)
	{
		var ret = []
		if (data)
		{
			for (var key in data)
			{
				var memSlot = data[key]
				ret.push(<tr key={key} ><td>{memSlot.address}</td><td>{memSlot.content.raw}</td><td>{memSlot.content.ascii}</td></tr>)
			}
		}
		return ret
	},

	resolveAddress: function(address)
	{
		if (!this.state.codes[address])
		{
			var hexCode = web3.eth.getCode(address)	
			var code = codeUtils.nameOpCodes(new Buffer(hexCode.substring(2), 'hex'))
			this.state.codes[address] = code[0]
			this.state.codesMap[address] = code[1]
		}
	},

	checkButtonState: function(incr)
	{
		if (!this.props.vmTrace)
			return "disabled"
		if (incr === -1)
			return this.state.currentSelected === 0 ? "disabled" : ""
		else if (incr === 1)
			return this.state.currentSelected >= this.props.vmTrace.length - 1 ? "disabled" : "" 
	},

	renderAssemblyItems: function()
	{
		if (this.props.vmTrace)
		{      
			return this.state.codes[this.state.currentAddress].map(function(item, i) 
			{
				return <option key={i} value={i} >{item}</option>;
			});	
		}
	},

	componentWillReceiveProps: function (nextProps) 
	{
		this.updateState(nextProps, 0)
	},

	updateState: function(props, vmTraceIndex)
	{
		var previousState = this.state.currentSelected
		var stateChanges = {}

		var currentAddress = this.state.currentAddress
		if (!currentAddress)
			currentAddress = props.vmTrace[vmTraceIndex].address
		if (props.vmTrace[vmTraceIndex].address && props.vmTrace[vmTraceIndex].address !== this.state.currentAddress)
		{
			this.resolveAddress(props.vmTrace[vmTraceIndex].address)
			stateChanges["currentAddress"] = props.vmTrace[vmTraceIndex].address
		}

		if (props.vmTrace[vmTraceIndex].stack)
		{
			var stack = props.vmTrace[vmTraceIndex].stack
			stack.reverse()
			stateChanges["currentStack"] = stack
		}

		if (props.vmTrace[vmTraceIndex].levels)
		{
			var levels = props.vmTrace[vmTraceIndex].levels
			var callStack = []
			for (var k in levels)
				callStack.push(props.vmTrace[levels[k]].address)	
			stateChanges["currentCallStack"] = callStack
			lastCallStack = callStack
		}

		var storageIndex = vmTraceIndex
		if (vmTraceIndex < previousState)
			storageIndex = this.retrieveLastSeenProperty(vmTraceIndex, "storage", props.vmTrace)
		if (props.vmTrace[storageIndex].storage || storageIndex === 0)
		{
			stateChanges["currentStorage"] = props.vmTrace[storageIndex].storage
			lastStorage = props.vmTrace[storageIndex].storage
		}

		var memoryIndex = vmTraceIndex
		if (vmTraceIndex < previousState)
			memoryIndex = this.retrieveLastSeenProperty(vmTraceIndex, "memory", props.vmTrace)	
		if (props.vmTrace[memoryIndex].memory || memoryIndex === 0)
		{
			stateChanges["currentMemory"] = this.formatMemory(props.vmTrace[memoryIndex].memory, 16)
			lastMemory = this.formatMemory(props.vmTrace[memoryIndex].memory, 16)
		}

		if (props.vmTrace[vmTraceIndex].calldata)
		{
			stateChanges["currentCallData"] = props.vmTrace[vmTraceIndex].calldata
			lastCallData = props.vmTrace[vmTraceIndex].calldata
		}
		stateChanges["selectedInst"] = this.state.codesMap[currentAddress][props.vmTrace[vmTraceIndex].pc]
		stateChanges["currentSelected"] = vmTraceIndex
		this.setState(stateChanges)
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
		var state = this.props.vmTrace[index];
		return state.instname === "CALL" || state.instname === "CREATE" || state.instname === "DELEGATECALL"
	},

	isReturnInstruction: function(index)
	{
		var state = this.props.vmTrace[index];
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
		while (++i < this.props.vmTrace.length) 
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
		this.updateState(this.props, index)
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
