'use strict'
import { add } from './util'
import { RefType } from './RefType'

export class Struct extends RefType {

  members

  constructor (memberDetails, location, fullType) {
    super(memberDetails.storageSlots, 32, 'struct ' + fullType, location)
    this.members = memberDetails.members
  }

  async decodeFromStorage (location, storageResolver) {
    const ret = {}
    for (var item of this.members) {
      const globalLocation = {
        offset: location.offset + item.storagelocation.offset,
        slot: add(location.slot, item.storagelocation.slot)
      }
      try {
        ret[item.name] = await item.type.decodeFromStorage(globalLocation, storageResolver)
      } catch (e) {
        console.log(e)
        ret[item.name] = '<decoding failed - ' + e.message + '>'
      }
    }
    return {value: ret, type: this.typeName}
  }

  decodeFromMemoryInternal (offset, memory) {
    const ret = {}
    this.members.map((item, i) => {
      var contentOffset = offset
      var member = item.type.decodeFromMemory(contentOffset, memory)
      ret[item.name] = member
      offset += 32
    })
    return {value: ret, type: this.typeName}
  }
}
