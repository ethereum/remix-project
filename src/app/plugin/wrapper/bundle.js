(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';

var _createClass = function () {
  function defineProperties(target, props) {
    for (var i = 0; i < props.length; i++) {
      var descriptor = props[i];descriptor.enumerable = descriptor.enumerable || false;descriptor.configurable = true;if ("value" in descriptor) descriptor.writable = true;Object.defineProperty(target, descriptor.key, descriptor);
    }
  }return function (Constructor, protoProps, staticProps) {
    if (protoProps) defineProperties(Constructor.prototype, protoProps);if (staticProps) defineProperties(Constructor, staticProps);return Constructor;
  };
}();

function _classCallCheck(instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError("Cannot call a class as a function");
  }
}

var RemixExtension = function () {
  function RemixExtension() {
    var _this = this;

    _classCallCheck(this, RemixExtension);

    this._notifications = {};
    this._pendingRequests = {};
    this._id = 0;
    window.addEventListener('message', function (event) {
      return _this._newMessage(event);
    }, false);
  }

  _createClass(RemixExtension, [{
    key: 'listen',
    value: function listen(key, type, callback) {
      if (!this._notifications[key]) this._notifications[key] = {};
      this._notifications[key][type] = callback;
    }
  }, {
    key: 'call',
    value: function call(key, type, params, callback) {
      this._id++;
      this._pendingRequests[this._id] = callback;
      window.parent.postMessage(JSON.stringify({
        action: 'request',
        key: key,
        type: type,
        value: params,
        id: this._id
      }), '*');
    }
  }, {
    key: '_newMessage',
    value: function _newMessage(event) {
      if (!event.data) return;
      if (typeof event.data !== 'string') return;

      var msg;
      try {
        msg = JSON.parse(event.data);
      } catch (e) {
        return console.log('unable to parse data');
      }
      var _msg = msg,
          action = _msg.action,
          key = _msg.key,
          type = _msg.type,
          value = _msg.value;

      if (action === 'notification') {
        if (this._notifications[key] && this._notifications[key][type]) {
          this._notifications[key][type](value);
        }
      } else if (action === 'response') {
        var _msg2 = msg,
            id = _msg2.id,
            error = _msg2.error;

        if (this._pendingRequests[id]) {
          this._pendingRequests[id](error, value);
          delete this._pendingRequests[id];
        }
      }
    }
  }]);

  return RemixExtension;
}();

if (window) window.RemixExtension = RemixExtension;
if (module && module.exports) module.exports = RemixExtension;

},{}]},{},[1]);
