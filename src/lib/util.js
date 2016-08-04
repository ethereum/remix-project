'use strict';
var EventManager = require('./eventManager');

module.exports = {
  extend: function (destination, source) {
    for (var property in source) {
      destination[property] = source[property];
    }
  },

  makeEventCapable: function (destination) {
    destination.event = new EventManager();
  }
};
