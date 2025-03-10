import { RLP } from '@ethereumjs/rlp'
import { keccak256 } from 'ethereum-cryptography/keccak'
import {
    Address,
    bigIntToUnpaddedBytes,
    concatBytes,
    ecsign,
    hexToBytes,
    privateToAddress,
    unpadBytes,
  } from '@ethereumjs/util'
  import type { AuthorizationListBytesItem } from '@ethereumjs/tx'

type GetAuthListOpts = {
    chainId?: number
    nonce?: number
    address: Address
    pkey?: Uint8Array
}

const defaultAuthPkey = hexToBytes(`0x${'20'.repeat(32)}`)
const defaultAuthAddr = new Address(privateToAddress(defaultAuthPkey))

const defaultSenderPkey = hexToBytes(`0x${'40'.repeat(32)}`)
const defaultSenderAddr = new Address(privateToAddress(defaultSenderPkey))

export const getAuthorizationListItem = (opts: GetAuthListOpts): AuthorizationListBytesItem => {
    const actualOpts = {
      ...{ chainId: 0, pkey: defaultAuthPkey },
      ...opts,
    }
  
    const { chainId, nonce, address, pkey } = actualOpts
  
    const chainIdBytes = unpadBytes(hexToBytes(`0x${chainId.toString(16)}`))
    const nonceBytes =
      nonce !== undefined ? unpadBytes(hexToBytes(`0x${nonce.toString(16)}`)) : new Uint8Array()
    const addressBytes = address.toBytes()
  
    const rlpdMsg = RLP.encode([chainIdBytes, addressBytes, nonceBytes])

    // @ts-ignore
    const msgToSign = keccak256(concatBytes(new Uint8Array([5]), rlpdMsg))
    const signed = ecsign(msgToSign, pkey)
  
    return [
      chainIdBytes,
      addressBytes,
      // @ts-ignore
      nonceBytes,
      bigIntToUnpaddedBytes(signed.v - BigInt(27)),
      unpadBytes(signed.r),
      unpadBytes(signed.s),
    ]
  }