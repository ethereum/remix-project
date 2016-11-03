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
  var report = this.txOriginNode.length + ' use of tx.origin\n'
  this.txOriginNode.map(function (item, i) {
    report += item.src + '\n'
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
