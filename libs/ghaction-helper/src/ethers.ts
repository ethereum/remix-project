// @ts-nocheck
import { ethers } from 'ethers'
import * as hhEtherMethods from './methods'

for(const method in hhEtherMethods) Object.defineProperty(ethers, method, { value: hhEtherMethods[method]}) 

export * from 'ethers'
export { ethers }