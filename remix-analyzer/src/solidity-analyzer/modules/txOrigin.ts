import { default as category } from './categories'
import { default as algorithm } from './algorithmCategories'

export default class txOrigin {
  txOriginNodes: any[] = []
  name = 'Transaction origin: '
  desc = 'Warn if tx.origin is used'
  categories = category.SECURITY
  algorithm = algorithm.EXACT

  visit (node) {
    if (node.name === 'MemberAccess' &&
    node.attributes.member_name === 'origin' &&
    (node.attributes.type === 'address' || node.attributes.type === 'address payable') &&
    node.children && node.children.length &&
    node.children[0].attributes.type === 'tx' &&
    node.children[0].attributes.value === 'tx') {
      this.txOriginNodes.push(node)
    }
  }

  report () {
    return this.txOriginNodes.map((item, i) => {
      return {
        warning: `Use of tx.origin: "tx.origin" is useful only in very exceptional cases. 
                  If you use it for authentication, you usually want to replace it by "msg.sender", because otherwise any contract you call can act on your behalf.`,
        location: item.src
      }
    })
  }
}
