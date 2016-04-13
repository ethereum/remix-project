var React = require('react');
var TxBrowser = require('./txBrowser');

module.exports = React.createClass({
  render: function() {
    return (<div>
    <p><h1>Debugger</h1></p>
    <TxBrowser/>
    </div>
    );
  }
});
