export function methods (): Record<string, unknown> {
  return {
    net_version: this.net_version,
    net_listening: this.net_listening,
    net_peerCount: this.net_peerCount
  }
}

export function net_version (payload, cb): void {
  // should be configured networkId
  cb(null, 1337)
}

export function net_listening (payload, cb): void {
  cb(null, true)
}

export function net_peerCount (payload, cb): void {
  cb(null, 0)
}
