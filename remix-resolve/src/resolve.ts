import axios from 'axios'
interface Imported {
  content: string;
  cleanURL: string;
  type: string;
}

interface PrvHandld {
  [filePath: string]: Imported
}

interface Handler {
  type: string;
  match(url: string): any;
  handle(match: any): any;
}

export class ImportResolver {
  previouslyHandled: PrvHandld[]
  constructor() {
    this.previouslyHandled = []
  }
  handleGithubCall(root: string, filePath: string) {
    return
  }
  handleHttp(url: string, cleanURL: string) {
    return
  }
  handleHttps(url: string, cleanURL: string) {
    return
  }
  handleSwarm(url: string, cleanURL: string) {
    return
  }
  async handleIPFS(url: string) {
    // replace ipfs:// with /ipfs/
    url = url.replace(/^ipfs:\/\/?/, 'ipfs/')
    console.log(url)
    try {
      const response = await axios.get('http://localhost:8080/' + url)
      return response.data
    } catch (e) {
      throw e
    }
    /*axios.get('http://localhost:8080/' + url)
      .then(function (response) {
        // handle success
        console.log(response);
        return response.data
      })
      .catch(function (error) {
      // handle error
      console.log(error);
      })
      .then(function () {
      // always executed
      });
    */
  }
  handleLocal(root: string, filePath: string) {
    return
  }
  getHandlers(): Handler[] {
    return [
      {
        type: 'github',
        match: (url) => { return /^(https?:\/\/)?(www.)?github.com\/([^/]*\/[^/]*)\/(.*)/.exec(url) },
        handle: (match) => { this.handleGithubCall(match[3], match[4]) }
      },
      {
        type: 'http',
        match: (url) => { return /^(http?:\/\/?(.*))$/.exec(url) },
        handle: (match) => { this.handleHttp(match[1], match[2]) }
      },
      {
        type: 'https',
        match: (url) => { return /^(https?:\/\/?(.*))$/.exec(url) },
        handle: (match) => { this.handleHttps(match[1], match[2]) }
      },
      {
        type: 'swarm',
        match: (url) => { return /^(bzz-raw?:\/\/?(.*))$/.exec(url) },
        handle: (match) => { this.handleSwarm(match[1], match[2]) }
      },
      {
        type: 'ipfs',
        match: (url) => { return /^(ipfs:\/\/?.+)/.exec(url) },
        handle: (match) => { this.handleIPFS(match[1]) }
      }
    ]
  }
  async resolve(filePath: string, customHandlers?: Handler[]) {
    var imported: Imported = this.previouslyHandled[filePath]
    if(imported) {
      return imported
    }
    const builtinHandlers: Handler[] = this.getHandlers()
    const handlers: Handler[] = customHandlers ? [...builtinHandlers, ...customHandlers] : [...builtinHandlers]
    handlers.forEach(handler => {
      const match = handler.match(filePath)
      if(match) {
        const content: any = handler.handle(match)
        imported = {
          content,
          cleanURL: filePath,
          type: handler.type
        }
        this.previouslyHandled[filePath] = imported
      }
    })
    return imported
  }
}
