## Plugin Service

Each plugin can be broken down into small lazy-loaded services. This is a great way to provide a modular API to your plugin.

Let's look at a "Command Line Interface" plugin that would expose a "git" service.

```typescript
const manager = new PluginManager()
const engine = new Engine()
const cmd = new Plugin({ name: 'cmd' })
const plugin = new Plugin({ name: 'caller' })

engine.register([manager, cmd, plugin])
await manager.activatePlugin(['cmd', 'caller'])

// Create a service inside cmd
// IMPORTANT: Your plugin needs to be activated before creating a service
await cmd.createService('git', {
  methods: ['fetch'],
  fetch: () => true,    // exposed
  commit: () => false   // not exposed
})

// Call a service
const fetched = await plugin.call('cmd.git', 'fetch')
```

**IMPORTANT**: Services are lazy-loaded. They can be created only _after activation_. 

### API

1. `createService`

A plugin can use `createService` to extends it's API.

```typescript
const git = await cmd.createService('git', {
  methods: ['fetch'],
  fetch: () => true,    // exposed
  commit: () => false   // not exposed
})
```

A service can also use `createService` to create a deeper service.

```typescript
await git.createService('deepGit', {
  methods: ['deepMethod'],
  deepMethod: () => console.log('Message from cmd.git.deepGit')
})
```

2. `call('name.service', 'method')`

To access a method from a plugin's service, you should use the name of the plugin and the name of the service separated by ".": `pluginName.serviceName`.

```typescript
// Call a service
await plugin.call('cmd.git', 'fetch')
// Call a deep nested service
await plugin.call('cmd.git.deepGit', 'deepMethod')
```

Only the methods defined inside the `methods` key of the services are exposed. **If not defined, all methods are exposed**.

3. `on('name', 'event')`

The event listener does **not** require the name of the service because the event is actually emitted at the plugin level.


```typescript
// Start lisening on event emitted by cmd plugin
plugin.on('cmd', 'committed', () => console.log('Committed!'))
const git = await cmd.createService('git', {})
// Service "git" from "cmd" emit event "committed"
git.emit('committed')
```


### PluginService

For a larger service, you might want to use a class based interface. For that, your must extend the abstract `PluginService` class.

You need to specify at least the :
- `path`: name of the service.
- `plugin`: the reference to the root plugin the service is attached to.

```typescript
// class based version
class GitService extends PluginService {
  path = 'git' // Name of the service
  methods = ['fetch']

  // Requires a reference to the plugin
  constructor(protected plugin: Plugin) {
    super()
  }

  fetch() {
    return true
  }

  commit() {
    return false
  }
}

// Class based plugin
class CmdPlugin extends Plugin {
  git: GitService

  constructor() {
    super({ name: 'cmd' })
  }

  // On Activation if git service is not defined, creates it
  async onActivation() {
    if (!this.git) {
      this.git = await this.createService('git', new GitService(this))
    }
  }
}
```

In this example, we activate the service on activation, but **only the first time**.

Now let's register the plugin : 
```typescript
const manager = new PluginManager()
const engine = new Engine()
const plugin = new Plugin({ name: 'caller' })
const cmd = new CmdPlugin()

engine.register([manager, cmd, plugin])
await manager.activatePlugin(['cmd', 'caller'])

// Service is already created by the `onActivation` hook.
const fetched = await plugin.call('cmd.git', 'fetch')
```