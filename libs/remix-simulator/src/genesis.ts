import { Block } from '@ethereumjs/block'
import { BN } from 'ethereumjs-util'

export function generateBlock (executionContext) {
  return new Promise((resolve, reject) => {
    const block: Block = Block.fromBlockData({
      header: {
        timestamp: (new Date().getTime() / 1000 | 0),
        number: 0,
        coinbase: '0x0e9281e9c6a0808672eaba6bd1220e144c9bb07a',
        difficulty: new BN('69762765929000', 10),
        gasLimit: new BN('8000000').imuln(1)
      }
    }, { common: executionContext.vmObject().common })

    executionContext.vm().runBlock({ block: block, generate: true, skipBlockValidation: true, skipBalance: false }).then(() => {
      executionContext.addBlock(block)
      resolve({})
    }).catch((e) => reject(e))
  })
}
