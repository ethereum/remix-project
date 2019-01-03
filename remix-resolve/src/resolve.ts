import axios from 'axios'

import { Api, ModuleProfile, API } from 'remix-plugin'

export interface RemixResolve extends Api {
  type: 'remix-resolve'
  events: {}
  resolve: Function
}

export const RemixResolveProfile: ModuleProfile<RemixResolve> = {
  type: 'remix-resolve',
  methods: ['resolve']
}


export interface Imported {
  content: string;
  cleanURL: string;
  type: string;
}

interface PreviouslyHandledImports {
  [filePath: string]: Imported
}

interface Handler {
  type: string;
  match(url: string): any;
  handle(match: any): any;
}

export class RemixResolveApi implements API<RemixResolve> {
  public readonly type = 'remix-resolve'

  previouslyHandled: PreviouslyHandledImports
  constructor() {
    this.previouslyHandled = {}
  }
  /**
  * Handle an import statement based on github
  * @params root The root of the github import statement
  * @params filePath path of the file in github
  */
  handleGithubCall(root: string, filePath: string) {
    return
  }
  /**
  * Handle an import statement based on http
  * @params url The url of the import statement
  * @params cleanURL
  */
  handleHttp(url: string, cleanURL: string) {
    return
  }
  /**
  * Handle an import statement based on https
  * @params url The url of the import statement
  * @params cleanURL
  */
  handleHttps(url: string, cleanURL: string) {
    return
  }
  handleSwarm(url: string, cleanURL: string) {
    return
  }
  /**
  * Handle an import statement based on IPFS
  * @params url The url of the IPFS import statement
  */
  async handleIPFS(url: string) {
    // replace ipfs:// with /ipfs/
    url = url.replace(/^ipfs:\/\/?/, 'ipfs/')
    try {
      const req = 'https://gateway.ipfs.io/' + url
      // If you don't find greeter.sol on ipfs gateway use local
      // const req = 'http://localhost:8080/' + url
      const response = await axios.get(req)
      return response.data
    } catch (e) {
      throw e
    }
  }
  handleLocal(root: string, filePath: string) {
    return
  }
  getHandlers(): Handler[] {
    return [
      {
        type: 'github',
        match: (url) => { return /^(https?:\/\/)?(www.)?github.com\/([^/]*\/[^/]*)\/(.*)/.exec(url) },
        handle: (match) => this.handleGithubCall(match[3], match[4])
      },
      {
        type: 'http',
        match: (url) => { return /^(http?:\/\/?(.*))$/.exec(url) },
        handle: (match) => this.handleHttp(match[1], match[2])
      },
      {
        type: 'https',
        match: (url) => { return /^(https?:\/\/?(.*))$/.exec(url) },
        handle: (match) => this.handleHttps(match[1], match[2])
      },
      {
        type: 'swarm',
        match: (url) => { return /^(bzz-raw?:\/\/?(.*))$/.exec(url) },
        handle: (match) => this.handleSwarm(match[1], match[2])
      },
      {
        type: 'ipfs',
        match: (url) => { return /^(ipfs:\/\/?.+)/.exec(url) },
        handle: (match) => this.handleIPFS(match[1])
      }
    ]
  }

  public async resolve(filePath: string, customHandlers?: Handler[]): Promise<Imported> {
    var imported: Imported = this.previouslyHandled[filePath]
    if(imported) {
      return imported
    }
    const builtinHandlers: Handler[] = this.getHandlers()
    const handlers: Handler[] = customHandlers ? [...builtinHandlers, ...customHandlers] : [...builtinHandlers]
    const matchedHandler = handlers.filter(handler => handler.match(filePath))
    const handler: Handler = matchedHandler[0]
    const match = handler.match(filePath)
    const content: string = await handler.handle(match)
    imported = {
      content,
      cleanURL: filePath,
      type: handler.type
    }
    this.previouslyHandled[filePath] = imported
    return imported
  }
}

export class ImportResolver {
  previouslyHandled: PreviouslyHandledImports
  constructor() {
    this.previouslyHandled = {}
  }
  /**
  * Handle an import statement based on github
  * @params root The root of the github import statement
  * @params filePath path of the file in github
  */
  handleGithubCall(root: string, filePath: string) {
    return
  }
  /**
  * Handle an import statement based on http
  * @params url The url of the import statement
  * @params cleanURL
  */
  handleHttp(url: string, cleanURL: string) {
    return
  }
  /**
  * Handle an import statement based on https
  * @params url The url of the import statement
  * @params cleanURL
  */
  handleHttps(url: string, cleanURL: string) {
    return
  }
  handleSwarm(url: string, cleanURL: string) {
    return
  }
  /**
  * Handle an import statement based on IPFS
  * @params url The url of the IPFS import statement
  */
  async handleIPFS(url: string) {
    // replace ipfs:// with /ipfs/
    url = url.replace(/^ipfs:\/\/?/, 'ipfs/')
    try {
      const req = 'https://gateway.ipfs.io/' + url
      // If you don't find greeter.sol on ipfs gateway use local
      // const req = 'http://localhost:8080/' + url
      const response = await axios.get(req)
      return response.data
    } catch (e) {
      throw e
    }
  }
  handleLocal(root: string, filePath: string) {
    return
  }
  getHandlers(): Handler[] {
    return [
      {
        type: 'github',
        match: (url) => { return /^(https?:\/\/)?(www.)?github.com\/([^/]*\/[^/]*)\/(.*)/.exec(url) },
        handle: (match) => this.handleGithubCall(match[3], match[4])
      },
      {
        type: 'http',
        match: (url) => { return /^(http?:\/\/?(.*))$/.exec(url) },
        handle: (match) => this.handleHttp(match[1], match[2])
      },
      {
        type: 'https',
        match: (url) => { return /^(https?:\/\/?(.*))$/.exec(url) },
        handle: (match) => this.handleHttps(match[1], match[2])
      },
      {
        type: 'swarm',
        match: (url) => { return /^(bzz-raw?:\/\/?(.*))$/.exec(url) },
        handle: (match) => this.handleSwarm(match[1], match[2])
      },
      {
        type: 'ipfs',
        match: (url) => { return /^(ipfs:\/\/?.+)/.exec(url) },
        handle: (match) => this.handleIPFS(match[1])
      }
    ]
  }
  async resolve(filePath: string, customHandlers?: Handler[]): Promise<Imported> {
    var imported: Imported = this.previouslyHandled[filePath]
    if(imported) {
      return imported
    }
    const builtinHandlers: Handler[] = this.getHandlers()
    const handlers: Handler[] = customHandlers ? [...builtinHandlers, ...customHandlers] : [...builtinHandlers]
    const matchedHandler = handlers.filter(handler => handler.match(filePath))
    const handler: Handler = matchedHandler[0]
    const match = handler.match(filePath)
    const content: string = await handler.handle(match)
    imported = {
      content,
      cleanURL: filePath,
      type: handler.type
    }
    this.previouslyHandled[filePath] = imported
    return imported
  }
}
