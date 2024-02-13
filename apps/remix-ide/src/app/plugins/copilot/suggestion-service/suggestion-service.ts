import EventEmitter from 'events'

export type SuggestOptions = { max_new_tokens: number, temperature: number, top_k: number, do_sample: boolean }

export class SuggestionService {
  worker: Worker
  // eslint-disable-next-line @typescript-eslint/ban-types
  responses: { [key: number]: Function }
  events: EventEmitter
  current: number
  constructor() {
    this.worker = new Worker(new URL('./worker.js', import.meta.url), {
      type: 'module'
    });
    this.events = new EventEmitter()
    this.responses = {}
    this.current
  }

  terminate(): void {
    this.worker.terminate()
    this.worker = new Worker(new URL('./worker.js', import.meta.url), {
      type: 'module'
    });
  }

  async init() {
    const onMessageReceived = (e) => {
      switch (e.data.status) {
      case 'initiate':
        this.events.emit(e.data.status, e.data)
        // Model file start load: add a new progress item to the list.
        break;

      case 'progress':
        this.events.emit(e.data.status, e.data)
        // Model file progress: update one of the progress items.
        break;

      case 'done':
        this.events.emit(e.data.status, e.data)
        // Model file loaded: remove the progress item from the list.
        break;

      case 'ready':
        this.events.emit(e.data.status, e.data)
        // Pipeline ready: the worker is ready to accept messages.
        break;

      case 'update':
        this.events.emit(e.data.status, e.data)
        // Generation update: update the output text.
        break;

      case 'complete':
        if (this.responses[e.data.id]) {
          if (this.current === e.data.id) {
            this.responses[e.data.id](null, e.data)
          } else {
            this.responses[e.data.id]('aborted')
          }
          delete this.responses[e.data.id]
          this.current = null
        }

        // Generation complete: re-enable the "Generate" button
        break;
      }
    };

    // Attach the callback function as an event listener.
    this.worker.addEventListener('message', onMessageReceived)

    this.worker.postMessage({
      cmd: 'init',
      model: 'Pipper/finetuned_sol'
    })
  }

  suggest (content: string, options: SuggestOptions)  {
    return new Promise((resolve, reject) => {
      if (this.current) return reject(new Error('already running'))
      const timespan = Date.now()
      this.current = timespan
      this.worker.postMessage({
        id: timespan,
        cmd: 'suggest',
        text: content,
        max_new_tokens: options.max_new_tokens,
        temperature: options.temperature,
        top_k: options.top_k,
        do_sample: options.do_sample
      })
      this.responses[timespan] = (error, result) => {
        if (error) return reject(error)
        resolve(result)
      }
    })
  }
}
