'use strict'
var React = require('react')
var Sticker = require('./sticker')
var style = require('./basicStyles')
var ASMCode = require('./asmCode')
var CalldataPanel = require('./calldataPanel')
var MemoryPanel = require('./memoryPanel')
var CallstackPanel = require('./callstackPanel')
var StackPanel = require('./stackPanel')
var StoragePanel = require('./storagePanel')

module.exports = React.createClass({
  getDefaultProps: function () {
    return {
      currentStepIndex: -1 // index of the selected item in the vmtrace
    }
  },

  render: function () {
    return (
      <div style={this.props.vmTrace === null ? style.hidden : style.display}>
        <div style={style.container}>
          <table>
            <tbody>
              <tr>
                <td>
                  <ASMCode ref='asmcode' currentStepIndex={this.props.currentStepIndex} />
                  <div style={Object.assign(style.inline, style.sticker)}>
                    <Sticker currentStepIndex={this.props.currentStepIndex} />
                  </div>
                </td>
                <td>
                  <StackPanel currentStepIndex={this.props.currentStepIndex} />
                </td>
              </tr>
              <tr>
                <td>
                  <StoragePanel currentStepIndex={this.props.currentStepIndex} />
                </td>
                <td>
                  <MemoryPanel currentStepIndex={this.props.currentStepIndex} />
                </td>
              </tr>
              <tr>
                <td>
                  <CalldataPanel currentStepIndex={this.props.currentStepIndex} />
                </td>
                <td>
                  <CallstackPanel currentStepIndex={this.props.currentStepIndex} />
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    )
  }
})
