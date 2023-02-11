## Create the Engine

1. Create the Plugin Manager

The plugin manager can activate/deactivate plugins, and manages permissions between plugins.
```typescript
import { PluginManager } from '@remixproject/engine';

const manager = new PluginManager()
```

2. Create the Engine

The engine manages the communication between plugins. It requires a `PluginManager`.
```typescript
import { PluginManager, Engine } from '@remixproject/engine';

const manager = new PluginManager()
const engine = new Engine()
```

3. Register a plugin

We need to register a plugin before activating it. This is done by the `Engine`.

> ⚠️ **IMPORTANT** You need to register the "manager" before beeing able to activate a plugin
```typescript
import { PluginManager, Engine, Plugin } from '@remixproject/engine';

const manager = new PluginManager()
const engine = new Engine()
const plugin = new Plugin({ name: 'plugin-name' })

// Register plugin
engine.register([manager, plugin])
```

4. Activate a plugin

*Once your plugin is registered* you can activate it. This is done by the `PluginManager`
```typescript
const manager = new PluginManager()
const engine = new Engine()
const plugin = new Plugin({ name: 'plugin-name' })

// Register plugins
engine.register([manager, plugin])

// Activate plugins
manager.activatePlugin('plugin-name')
```


🧪 [Tested code available here](../../examples/engine/tests/1-getting-started.ts)