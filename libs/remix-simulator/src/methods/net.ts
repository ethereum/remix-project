
export class Net {

  methods () {
    return {
      net_version: this.net_version,
      net_listening: this.net_listening,
      net_peerCount: this.net_peerCount
    }
  }

  net_version (payload, cb) {
    // should be configured networkId
    cb(null, 1337)
  }

  net_listening (payload, cb) {
    cb(null, true)
  }

  net_peerCount (payload, cb) {
    cb(null, 0)
  }
}
