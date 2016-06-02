require('es6-shim');
var app = require('./app.js');
var $ = require('jquery');

$(document).ready(function() { app.run(); });