'use strict'
var React = require('react')

module.exports = React.createClass({
  contextTypes: {
    web3: React.PropTypes.object
  },

  getInitialState: function () {
    return {
      storage: {},
      storageChanges: [],
      vmTraceIndexByStorageChange: {},
      vmTraceChangesRef: []
    }
  },

  init: function () {
    var defaultState = this.getInitialState()
    this.state.storage = defaultState.storage
    this.state.storageChanges = defaultState.storageChanges
    this.state.vmTraceIndexByStorageChange = defaultState.vmTraceIndexByStorageChange
    this.state.vmTraceChangesRef = defaultState.vmTraceChangesRef
  },

  render: function () {
    return null
  },

  // retrieve the storage of an account just after the execution of txHash
  retrieveStorage: function (address, transaction, callBack) {
    if (this.state.storage[address]) {
      callBack(this.state.storage[address])
    }
    var self = this
    if (transaction) {
      this.context.web3.debug.storageAt(transaction.blockNumber.toString(), transaction.transactionIndex, address, function (error, result) {
        if (error) {
          console.log(error)
        } else {
          self.state.storage[address] = result
          callBack(result)
        }
      })
    } else {
      console.log('transaction is not defined')
    }
  },

  trackStorageChange: function (vmTraceIndex, trace) {
    var change = false
    if (trace.address) {
      // new context
      this.state.storageChanges.push({ address: trace.address, changes: [] })
      change = true
    } else if (trace.depth && !trace.address) {
      // returned from context
      this.state.storageChanges.push({ address: this.state.storageChanges[this.state.storageChanges.length - 1].address, changes: [] })
      change = true
    } else if (trace.inst === 'SSTORE') {
      this.state.storageChanges[this.state.storageChanges.length - 1].changes.push(
        {
          'key': trace.stack[trace.stack.length - 1],
          'value': trace.stack[trace.stack.length - 2]
        })
      change = true
    }

    if (change) {
      this.state.vmTraceIndexByStorageChange[vmTraceIndex] = {
        context: this.state.storageChanges.length - 1,
        changes: this.state.storageChanges[this.state.storageChanges.length - 1].changes.length - 1
      }
      this.state.vmTraceChangesRef.push(vmTraceIndex)
    }
  },

  rebuildStorageAt: function (vmTraceIndex, transaction, callBack) {
    var changesLocation = this.retrieveLastChange(vmTraceIndex)
    if (!changesLocation) {
      console.log('unable to build storage')
      callBack({})
    } else {
      var address = this.state.storageChanges[changesLocation.context].address
      this.retrieveStorage(address, transaction, function (storage) {
        for (var k = 0; k < changesLocation.context; k++) {
          var context = this.state.storageChanges[k]
          if (context.address === address) {
            for (var i = 0; i < context.changes.length; i++) {
              if (i > changesLocation.changes) break
              var change = context.changes[i]
              storage[change.key] = change.value
            }
          }
        }
        callBack(storage)
      })
    }
  },

  retrieveLastChange: function (vmTraceIndex) {
    var change = this.state.vmTraceIndexByStorageChange[vmTraceIndex]
    if (change) {
      return change
    } else {
      for (var k in this.state.vmTraceChangesRef) {
        if (this.state.vmTraceChangesRef[k] > vmTraceIndex) {
          return this.state.vmTraceIndexByStorageChange[k - 1]
        }
      }
    }
  }
})
