# Engine

The `Engine` deals with the registration of the plugins, to make sure they are available for activation. 

It manages the interaction between plugins (calls & events).

## Constructor
The `Engine` depends on the plugin manager for the permission system.

```typescript
const manager = new PluginManager()
const engine = new Engine()
engine.register(manager)
```


### register
```typescript
register(plugins: Plugin | Plugin[]): string | string[]
```

Register one or several plugins into the engine and return their names.

A plugin **must be register before being activated**.

### isRegistered
```typescript
isRegistered(name: string): boolean
```

Checks if a plugin with this name has already been registered by the engine.

## Hooks

### onRegistration
```typescript
onRegistration(plugin: Plugin) {}
```

This method triggered when a plugin is registered.