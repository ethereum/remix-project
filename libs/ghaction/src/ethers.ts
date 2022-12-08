import { ethers } from 'ethers'
import * as ganache from 'ganache'
import * as hhEtherMethods from './methods'

global.ganacheProvider = ganache.provider({ logging: { quiet: true } })
for(const method in hhEtherMethods) Object.defineProperty(ethers, method, { value: hhEtherMethods[method]})

export * from 'ethers'
export { ethers }