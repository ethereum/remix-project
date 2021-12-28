type registryEntry = {
    api: any,
    name: string
}

export default class Registry {
    private static instance: Registry;
    private state: any

    private constructor () {
      this.state = {}
    }

    public static getInstance (): Registry {
      if (!Registry.instance) {
        Registry.instance = new Registry()
      }

      return Registry.instance
    }

    public put (entry: registryEntry) {
      if (this.state[entry.name]) return this.state[entry.name]
      const server = {
      // uid: serveruid,
        api: entry.api
      }
      this.state[entry.name] = { server }
      return server
    }

    public get (name: string) {
      const state = this.state[name]
      if (!state) return
      const server = state.server
      return server
    }
}
