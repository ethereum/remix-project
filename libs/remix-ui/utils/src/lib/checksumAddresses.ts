import { getAddress } from 'ethers'

export const checksumAddressesRaw = (value: any, input: any): any => {
  const type: string = input?.type || ''
  if (type === 'address' && typeof value === 'string') {
    try { return getAddress(value.toLowerCase()) } catch { return value }
  }
  if (type === 'address[]' && Array.isArray(value)) {
    return value.map((v: string) => { try { return getAddress(v.toLowerCase()) } catch { return v } })
  }
  if (type === 'tuple' && input?.components) {
    // tuples are represented as positional arrays (one value per member, in declaration order)
    if (Array.isArray(value)) {
      return input.components.map((comp: any, i: number) => checksumAddressesRaw(value[i], comp))
    }
    // tolerate an object keyed by member name (fallback)
    if (typeof value === 'object' && value !== null) {
      return input.components.map((comp: any) => checksumAddressesRaw(value[comp.name], comp))
    }
    return value
  }
  if (type === 'tuple[]' && input?.components && Array.isArray(value)) {
    return value.map((item: any) => {
      if (Array.isArray(item)) {
        return input.components.map((comp: any, i: number) => checksumAddressesRaw(item[i], comp))
      }
      if (typeof item === 'object' && item !== null) {
        return input.components.map((comp: any) => checksumAddressesRaw(item[comp.name], comp))
      }
      return item
    })
  }
  return value
}

export const checksumAddressesInValue = (value: any, input: any): string => {
  const result = checksumAddressesRaw(value, input)
  return typeof result === 'string' ? result : JSON.stringify(result)
}
