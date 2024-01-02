import {EventEmitter} from 'events'

// Max duration to batch session data before sending it to the renderer process.
const BATCH_DURATION_MS = 16

// Max number of events to batch before sending them to the renderer process.
const BATCH_MAX_SIZE = 50

export class PluginEventDataBatcher extends EventEmitter {
  uid: number
  data!: any[]
  timeout!: NodeJS.Timeout | null
  constructor(uid: number) {
    super()
    this.uid = uid

    this.reset()
  }

  reset() {
    this.data = []
    this.timeout = null
  }

  write(key: string, ...payload: any): void {
    if (this.data.length >= BATCH_MAX_SIZE) {
      // We've reached the max batch size. Flush it and start another one
      if (this.timeout) {
        clearTimeout(this.timeout)
        this.timeout = null
      }
      this.flush()
    }

    this.data.push({
      key,
      payload,
    })

    if (!this.timeout) {
      this.timeout = setTimeout(() => this.flush(), BATCH_DURATION_MS)
    }
  }

  flush() {
    // Reset before emitting to allow for potential reentrancy
    const data = this.data
    this.reset()

    this.emit('flush', data)
  }
}
