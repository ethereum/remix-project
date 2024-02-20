import EventEmitter from 'events'

export class SuggestionService {
  worker: Worker
  responses: Array<any>
  events: EventEmitter
  constructor() {
    console.log('SuggestionService instanciate worker')
    this.worker = new Worker(new URL('./worker.js', import.meta.url), {
      type: 'module'
    });
    this.init()
    this.events = new EventEmitter()
    this.responses = []
  }

  async init() {
    const onMessageReceived = (e) => {
      switch (e.data.status) {
      case 'initiate':
        console.log(e.data)
        this.events.emit(e.data.status, e.data)
        // Model file start load: add a new progress item to the list.
        break;

      case 'progress':
        this.events.emit(e.data.status, e.data)
        console.log(e.data)
        // Model file progress: update one of the progress items.
        break;

      case 'done':
        this.events.emit(e.data.status, e.data)
        console.log(e.data)
        // Model file loaded: remove the progress item from the list.
        break;

      case 'ready':
        this.events.emit(e.data.status, e.data)
        console.log(e.data)
        // Pipeline ready: the worker is ready to accept messages.
        break;

      case 'update':
        this.events.emit(e.data.status, e.data)
        console.log(e.data)
        // Generation update: update the output text.
        break;

      case 'complete':
        console.log(e.data)
        if (this.responses[e.data.id]) {
          this.responses[e.data.id](null, e.data)
        } else {
          console.log('no callback for', e.data)
        }
        
        // Generation complete: re-enable the "Generate" button
        break;
      }
    };

    // Attach the callback function as an event listener.
    this.worker.addEventListener('message', onMessageReceived)

    this.worker.postMessage({
      cmd: 'init',
      model: 'Pipper/solstarcoder'
    })
  }

  suggest (content: string, max_new_tokens: number, temperature: number, top_k: number, do_sample: boolean)  {
    return new Promise((resolve, reject) => {
      this.worker.postMessage({
        id: this.responses.length,
        cmd: 'suggest',
        text: content,
        max_new_tokens,
        temperature,
        top_k,
        do_sample
      })
      this.responses.push((error, result) => {
        if (error) return reject(error)
        resolve(result)
      })
    })    
  }
}