'use strict'
var ReactDOM = require('react-dom')
var React = require('react')
var util = require('./helpers/init')
var Debugger = require('./debugger')

ReactDOM.render(
  <Debugger context={util.loadContext()} />,
  document.getElementById('app')
)
