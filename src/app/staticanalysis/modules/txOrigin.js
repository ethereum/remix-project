var name = 'tx origin'
var desc = 'warn if tx.origin is used'

function txOrigin () {
  this.txOriginNode = []
}

txOrigin.prototype.visit = function (node) {
  if (node.name === 'MemberAccess' &&
  node.attributes.member_name === 'origin' &&
  node.attributes.type === 'address' &&
  node.children && node.children.length &&
  node.children[0].attributes.type === 'tx' &&
  node.children[0].attributes.value === 'tx') {
    this.txOriginNode.push(node)
  }
}

txOrigin.prototype.report = function (node) {
  var report = []
  this.txOriginNode.map(function (item, i) {
    report.push({
      warning: 'use of tx.origin: "tx.origin" is useful only in very exceptional cases.\nIf you use it for authentication, you usually want to replace it by "msg.sender", because otherwise any contract you call can act on your behalf.',
      location: item.src
    })
  })
  return {
    name: name,
    report: report
  }
}

module.exports = {
  name: name,
  description: desc,
  Module: txOrigin
}
