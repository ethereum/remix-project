# Plugin Manager

The `PluginManager` deals with activation and deactivation of other plugins. It also manages the permission layer between two plugins.

You can use it with a very loose permissions, or inherit from it to create a custom set of permission rules.

```typescript
class RemixManager extends PluginManager {
  remixPlugins = ['manager', 'solidity', 'fileManager', 'udapp']

  // Create custom method
  isFromRemix(name: string) {
    return this.remixPlugins.includes(name)
  }

  canActivate(from: Profile, to: Profile) {
    return this.isFromRemix(from.name)
  }
}
```

## Events

### profileAdded
```typescript
this.on('manager', 'profileAdded', (profile: Profile) => { ... })
```
Emitted when a plugin has been registered by the `Engine`. 

### profileUpdated
```typescript
this.on('manager', 'profileUpdated', (profile: Profile) => { ... })
```
Emitted when a plugin updates its profile through the `updateProfile` method.

### pluginActivated
```typescript
this.on('manager', 'pluginActivated', (profile: Profile) => { ... })
```
Emitted when a plugin has been activated, either with `activatePlugin` or `toggleActive`.

> If the plugin was already active, the event won't be triggered.

### pluginDeactivated
```typescript
this.on('manager', 'pluginDeactivated', (profile: Profile) => { ... })
```
Emitted when a plugin has been deactivated, either with `deactivatePlugin` or `toggleActive`.

> If the plugin was already deactivated, the event won't be triggered.


## Constructor
Used to create a new instance of `PluginManager`. You can specify the profile of the manager to extend the default one.

_The property `name` of the profile must be `manager`._

```typescript
const profile = { name: 'manager', methods: [...managerMethods, 'isFromRemiw' ] }
const manager = new RemixManager(profile)
```

## Properties

### requestFrom
Return the name of the caller. If no request was provided, it means that the method has been called from the IDE - so we use "manager". 

_Use this method when you expose custom methods from the Plugin Manager._

## Methods

### getProfile
Get the profile if its registered.

```typescript
const profile = manager.getProfile('solidity')
```

### updateProfile
Update the profile of the plugin. This method is used to lazy load services in plugins.

_Only the caller plugn can update its profile._

_The properties "name" and "url" cannot be updated._

```typescript
const methods = [ ...solidity.methods, 'serviceMethod' ]
await solidity.call('manager', 'updateProfile', { methods })
```

### isActive
Verify if a plugin is currently active.

```typescript
const isActive = await manager.isActive('solidity')
```

### activatePlugin
Check if caller can activate a plugin and activate it if authorized.

_This method call `canActivate` under the hood._

It can be called directly on the `PluginManager`:
```typescript
manager.activatePlugin('solidity')
```

Or from another plugin (for dependancy for example) :
```typescript
class EthDoc extends Plugin {
  onActivation() {
    return this.call('manager', 'activatePlugin', ['solidity', 'remix-tests'])
  }
}
```

### deactivatePlugin
Check if caller can deactivate plugin and deactivate it if authorized.

_This method call `canDeactivate` under the hood._

It can be called directly on the `PluginManager`:
```typescript
manager.deactivatePlugin('solidity')
```

Or from another plugin :
```typescript
class EthDoc extends Plugin {
  onDeactivation() {
    return this.call('manager', 'deactivatePlugin', ['solidity', 'remix-tests'])
  }
}
```

> Deactivating a plugin can have side effect on other plugins that depend on it. We recommend limiting the access to this method to a small set of plugins -if any (see `canDeactivate`).

### toggleActive
Activate or deactivate by bypassing permission.

_This method should ONLY be used by the IDE. Do not expose this method to other plugins._

```typescript
manager.toggleActive('solidity') // Toggle One
manager.toggleActive(['solidity', 'remix-tests'])  // Toggle Many
```

## Permission

By extending the `PluginManager` you can override the permission methods to create your own rules.

### canActivate
Check if a plugin can activate another.

**Params**
- `from`: The profile of the caller plugin.
- `to`: The profile of the target plugin.

```typescript
class RemixManager extends PluginManager {
  // Ask permission to user if it's not a plugin from Remix
  async canActivate(from: Profile, to: Profile) {
    if (this.isFromRemix(from.name)) {
      return true
    } else {
      return confirm(`Can ${from.name} activates ${to.name}`)
    }
  }
}
```

> Don't forget to let 'manager' activate plugins if you're not using `toggleActivate`.

### canDeactivate
Check if a plugin can deactivate another.

**Params**
- `from`: The profile of the caller plugin.
- `to`: The profile of the target plugin.

```typescript
class RemixManager extends PluginManager {
  // Only "manager" can deactivate plugins
  async canDeactivate(from: Profile, to: Profile) {
    return from.name === 'manager'
  }
}
```


> Don't forget to let 'manager' deactivate plugins if you're not using `toggleActivate`.


### canCall
Check if a plugin can call a method of another plugin.

**Params**
- `from`: Name of the caller plugin
- `to`: Name of the target plugin
- `method`: Method targeted by the caller
- `message`: Optional Message to display to the user


This method can be called from a plugin to protect the access to one of its methods.
Every plugin implements a helper function that takes care of `from` & `to`
```typescript
class SensitivePlugin extends Plugin {
  async sensitiveMethod() {
    const canCall = await this.askUserPermission('sensitiveMethod', 'This method give access to sensitvie information')
    if (canCall) {
      // continue sensitive method
    }
  }
}
```

Then the IDE defines how to handle this call :
```typescript
class RemixManager extends PluginManager {
  // Keep track of the permissions
  permissions: {
    [name: string]: {
      [methods: name]: string[]
    }
  } = {}
  // Remember user preference
  async canCall(from: Profile, to: Profile, method: string) {
    // Make sure the caller of this methods is the target plugin
    if (to.name !== this.currentRequest) {
      return false
    }
    // Check if preference exist, else ask the user
    if (!this.permissions[from.name]) {
      this.permissions[from.name] = {}
    }
    if (!this.permissions[from.name][method]) {
      this.permissions[from.name][method] = []
    }
    if (this.permissions[from.name][method].includes(to.name)) {
      return true
    } else {
      confirm(`Can ${from.to} call method ${method} of ${to.name} ?`)
        ? !!this.permissions[from.name][method].push(to.name)
        : false
    }
  }
}
```

> Consider keeping the preferences in the localstorage for a better user experience.

## Activation Hooks
`PluginManager` provides an interface to react to changes of its state.

  protected onPluginActivated?(profile: Profile): any
  protected onPluginDeactivated?(profile: Profile): any
  protected onProfileAdded?(profile: Profile): any

### onPluginActivated
Triggered whenever a plugin has been activated.

```typescript
class RemixManager extends PluginManager {
  onPluginActivated(profile: Profile) {
    updateMyUI('activate', profile.name)
  }
}
```

### onPluginDeactivated
Triggered whenever a plugin has been deactivated.

```typescript
class RemixManager extends PluginManager {
  onPluginDeactivated(profile: Profile) {
    updateMyUI('deactivate', profile.name)
  }
}
```

### onProfileAdded
Triggered whenever a plugin has been registered (profile is added to the manager).

```typescript
class RemixManager extends PluginManager {
  onPluginDeactivated(profile: Profile) {
    updateMyUI('add', profile)
  }
}
```

