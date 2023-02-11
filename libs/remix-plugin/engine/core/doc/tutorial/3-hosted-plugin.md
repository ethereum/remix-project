## Hosted Plugin

If your plugin has a UI, you can specify where to host it. For that you need: 
- A `HostPlugin` that manages the view.
- A `ViewPlugin` that displays the UI of your plugin.

### Host Plugin
The Host plugin defines a zone on your IDE where a plugin can be displayed. It must exposes 3 methods: 
- `addView`: Add a new view plugin in the zone.
- `removeView`: Remove an existing view plugin from that zone.
- `focus`: Focus the UI of the view on the zone.

> Adding a view doesn't focus the UI automatically, you need to trigger the `focus` method for that.

_The way to add/draw element on the screen is different depending on your framework (LitElement, Vue, React, Angular, Svelte, ...). In this example we are going to use directly the standard Web API. Note that there is no support for WebGL yet, consider opening an issue if you're in this situation._

1. Create a `HostPlugin`

Let's extend the `HostPlugin` to create a zone on the side part of the screen:

```typescript
// Host plugin display
class SidePanel extends HostPlugin {
  plugins: Record<string, HTMLElement> = {}
  focused: string
  root: Element
  constructor() {
    // HostPlugin automatically expose the 4 abstract methods 'focus', 'isFocus', 'addView', 'removeView'
    super({ name: 'sidePanel' })
  }
  currentFocus(): string {}
  addView(profile: Profile, view: HTMLElement) {}
  removeView(profile: Profile) {}
  focus(name: string) {}
}
```

> Remix IDE defines two zone "sidePanel" & "mainPanel". We recommend using those two names as plugins working on Remix IDE will work on your IDE as well.

2. Define the root element of the `SidePanel`

The `root` element of a `HostPlugin` is the container node. Let's default it to the body element here.

```typescript
constructor(root = document.body) {
  super({ name: 'sidePanel' })
  this.root = root
}
```

3. Implements `addView`

When a view plugin is added, the reference of the view plugin's HTMLElement is passed to the method.

```typescript
addView(profile: Profile, view: HTMLElement) {
  this.plugins[profile.name] = view
  view.style.display = 'none'   // view is added but not displayed
  this.root.appendChild(view)
}
```

4. Implements `focus`

Here we want to display one specific view amongst all the views of the panel. 

```typescript
focus(name: string) {
  if (this.plugins[name]) {
    // Remove focus on previous view if any
    if (this.plugins[this.focused]) this.plugins[this.focused].style.display = 'none'
    this.plugins[name].style.display = 'block'
    this.focused = name
  }
}
```

5. Implements `currentFocus`

Return the name of the current focussed plugin in the Host Plugin.

```typescript
currentFocus() {
  return this.focused
}
```

6. Implements `removeView`

We remove the view from the list, and remove the focus if it had it.

```typescript
removeView(profile: Profile) {
  if (this.plugins[name]) {
    this.root.removeChild(this.plugins[profile.name])
    if (this.focused === profile.name) delete this.focused
    delete this.plugins[profile.name]
  }
}
```

### ViewPlugin

Ok, now that we have our `HostPlugin` we can write a simple `ViewPlugin` to inject into.

A `ViewPlugin` must: 
- have a `location` key in its profile, with the name of the `HostPlugin`.
- implement the `render` method that returns its root element.

```typescript
class HostedPlugin extends ViewPlugin {
  root: HTMLElement
  constructor() {
    // Specific the location where this plugin is hosted
    super({ name: 'hosted', location: 'sidePanel' })
  }
  // Render the element into the host plugin
  render(): Element {
    if (!this.root) {
      this.root = document.createElement('div')
    }
    return this.root
  }
}
```

### Instantiate them in the Engine

The `ViewPlugin` will add itself into its `HostPlugin` once activated.

**Important**: When activating a `HostPlugin` and a `ViewPlugin` with one call, the order is important (see comment in the code below).

```typescript
const manager = new PluginManager()
const engine = new Engine()
const sidePanel = new SidePanel()
const hosted = new Host

// Register both plugins
engine.register([manager, sidePanel, hosted])

// Activate both plugins: ViewPlugin will automatically be added to the view
// The order here is important
await manager.activatePlugin(['sidePanel', 'hosted'])

// Focus on 
sidePanel.focus('hosted')

// Deactivate 'hosted' will remove its view from the sidepanel
await manager.deactivatePlugin(['hosted'])
```

⚠️ Do not deactive a `HostPlugin` that still manage activated `ViewPlugin`.

🧪 [Tested code available here](../../examples/engine/tests/3-hosted-plugin.ts)