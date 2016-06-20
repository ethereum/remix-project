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
  render: function () {
    return (
      <div style={this.props.vmTrace === null ? style.hidden : style.display}>
        <div style={style.container}>
          <table>
            <tbody>
              <tr>
                <td>
                  <ASMCode />
                  <div style={Object.assign(style.inline, style.sticker)}>
                    <Sticker />
                  </div>
                </td>
                <td>
                  <StackPanel />
                </td>
              </tr>
              <tr>
                <td>
                  <StoragePanel />
                </td>
                <td>
                  <MemoryPanel />
                </td>
              </tr>
              <tr>
                <td>
                  <CalldataPanel />
                </td>
                <td>
                  <CallstackPanel />
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    )
  }
})
