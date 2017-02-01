'use strict'

require('babel-polyfill')
var app = require('./app.js')
var $ = require('jquery')

$(document).ready(function () { app.run() })
