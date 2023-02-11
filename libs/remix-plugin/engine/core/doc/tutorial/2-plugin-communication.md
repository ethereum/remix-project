## Plugins Communication

### Methods

Each plugin can call methods exposed by other plugin. Let's see how to expose a method from one plugin and call it from another.

1. Create Plugin that exposes a method
You can extend the `Plugin` class to create your own plugin. The list of exposed methods are defined in the field `methods` of the profile: 
```typescript
class FirstPlugin extends Plugin {
  constructor() {
    // Expose method "getVersion" to other plugins
    super({ name: 'first', methods: ['getVersion']})
  }
  // Implementation of the exposed method
  getVersion() {
    return 0
  }
}
```

2. Create a Plugin that calls the `getVersion`
The `Plugin` class provides a `call` method to make a request to another plugin's methods

> The `call` method is available only when the plugin is activated by the plugin manager

```typescript
class SecondPlugin extends Plugin {
  constructor() {
    super({ name: 'second' })
  }

  getFirstPluginVersion(): Promise<number> {
    // Call the methode "getVersion" of plugin "first"
    return this.call('first', 'getVersion')
  }
}
```

3. Register & activate plugins
`Engine` & `PluginManager` can register & activate a list of plugins at once.
```typescript
const manager = new PluginManager()
const engine = new Engine()
const first = new FirstPlugin()
const second = new SecondPlugin()

// ⚠️ Don't forget to wait for the manager to be loaded
await engine.onload()

// Register both plugins 
engine.register([manager, first, second])

// Activate both plugins
await manager.activatePlugin(['first', 'second'])

// Call method "getVersion" of first plugin from second plugin 
const firstVersion = await second.getFirstPluginVersion()
```

### Events

Every plugin can emit and listen to events with : 
- `emit`: Broadcast an event to all plugins listening.
- `on`: Listen to an event from another plugin.
- `once`: Listen once to one event of another plugin.
- `off`: Stop listening on an event that the plugin was listening to.

```typescript
// Listen and broadcast "count" event
let value = 0
second.on('first', 'count', (count: number) => value = count)
first.emit('count', 1)
first.emit('count', 2)

// Stop listening on event
second.off('first', 'count')
```


## Full Example

```typescript
class FirstPlugin extends Plugin {
  constructor() {
    // Expose method "getVersion" to other plugins
    super({ name: 'first', methods: ['getVersion']})
  }
  // Implementation of the exposed method
  getVersion() {
    return 0
  }
}

class SecondPlugin extends Plugin {
  constructor() {
    super({ name: 'second' })
  }

  getFirstPluginVersion(): Promise<number> {
    // Call the methode "getVersion" of plugin "first"
    return this.call('first', 'getVersion')
  }
}


const manager = new PluginManager()
const engine = new Engine()
const first = new FirstPlugin()
const second = new SecondPlugin()

// Register both plugins 
engine.register([manager, first, second])

// Activate both plugins
await manager.activatePlugin(['first', 'second'])

// Call method "getVersion" of first plugin from second plugin 
const firstVersion = await second.getFirstPluginVersion()

// Listen and broadcast "count" event
let value = 0
second.on('first', 'count', (count: number) => value = count)
first.emit('count', 1)
first.emit('count', 2)

// Stop listening on event
second.off('first', 'count')
```

🧪 [Tested code available here](../../examples/engine/tests/2-plugin-communication.ts)