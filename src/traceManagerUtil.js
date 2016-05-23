module.exports = {
  // util section
  findLowerBound: function (target, changes) {
    if (changes.length === 0) {
      return undefined
    }

    if (changes.length === 1) {
      if (changes[0] > target) {
        // we only a closest maximum, returning O
        return 0
      } else {
        return changes[0]
      }
    }

    var middle = Math.floor(changes.length / 2)
    if (changes[middle] > target) {
      return this.findLowerBound(target, changes.slice(0, middle))
    } else if (changes[middle] < target) {
      return this.findLowerBound(target, changes.slice(middle, changes.length))
    } else {
      return changes[middle]
    }
  },

  resolveCalledAddress: function (vmTraceIndex, trace) {
    var address = trace[vmTraceIndex].address
    if (vmTraceIndex > 0) {
      var stack = trace[vmTraceIndex - 1].stack // callcode, delegatecall, ...
      address = stack[stack.length - 2]
    }
    return address
  }

}
