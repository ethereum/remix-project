var React = require('react');
var TxBrowser = require('./txBrowser');

module.exports = React.createClass({
  render: function() {
    return (<div>
    <p>Debugger</p>
    <TxBrowser/>
    </div>
    );
  }
});
