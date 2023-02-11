import { Plugin } from '@remixproject/engine'
import { PluginOptions } from '@remixproject/plugin-utils'
import { window, Disposable, TreeDataProvider, commands, EventEmitter, TreeView, TreeItem } from 'vscode'

type ID = string | number


//////////
// ITEM //
//////////

export class Item<I> extends TreeItem {
  constructor(label: string, pluginName: string, private item: I) {
    super(label)
    this.command = {
      title: 'Select',
      command: `${pluginName}.select`,
      arguments: [this.item]
    }
  }
}

////////////////////////
// LIST DATA PROVIDER //
////////////////////////

export class List<I> implements TreeDataProvider<I> {
  private list: I[]
  private options = { idKey: 'id', labelKey: 'label' }
  public render = new EventEmitter<I>()
  onDidChangeTreeData = this.render.event

  constructor(private name: string, initial: I[] = []) {
    this.list = initial
  }

  setOptions(options: Partial<ListOptions>) {
    this.options = { ...this.options, ...options }
    this.render.fire(undefined)
  }

  reset(list: I[]) {
    this.list = list
    this.render.fire(undefined)
  }

  getParent() {
    return undefined // Needed for "[TreeView].reveal"
  }

  getTreeItem(element: I): Item<I> {
    if (element) {
      const label = element[this.options.labelKey]
      const item = new Item(label, this.name, element)
      return item
    }
  }

  getChildren(): I[] {
    return this.list
  }
}



export interface ListOptions {
  idKey: string
  labelKey: string
}

export type ListPluginOptions = PluginOptions & ListOptions

const methods = [ 'getIds', 'getItem', 'getAll', 'reset', 'select', 'add', 'remove', 'update' ]


export class DynamicListPlugin<I, T extends List<I> = List<I>> extends Plugin {
  private listeners: Disposable[] = []
  protected options: ListPluginOptions
  protected treeView: TreeView<I>
  protected entities: Record<string, I>
  protected selected: ID
  list: T

  constructor(name: string, options?: Partial<ListPluginOptions>) {
    super({ name, methods })
    this.setOptions({ idKey: 'id', labelKey: 'label', ...options })
  }

  setOptions(options: Partial<ListPluginOptions>) {
    super.setOptions(options)
    if (this.list) {
      const { idKey, labelKey } = this.options
      this.list.setOptions({ idKey, labelKey })
    }
  }

  activate() {
    if (!this.list) {
      this.list = new List<I>(this.profile.name) as T
    }
    const { idKey, labelKey } = this.options
    this.list.setOptions({ idKey, labelKey })
    this.treeView = window.createTreeView(`${this.profile.name}`, { treeDataProvider: this.list })
    this.listeners = [
      this.treeView,
      commands.registerCommand(`${this.profile.name}.select`, item => this.select(item)),
      commands.registerCommand(`${this.profile.name}.reset`, items => this.reset(items)),
      commands.registerCommand(`${this.profile.name}.add`, item => this.add(item)),
      commands.registerCommand(`${this.profile.name}.remove`, (id) => this.remove(id)),
      commands.registerCommand(`${this.profile.name}.update`, (id, item) => this.update(id, item)),
    ]
    super.activate()
  }

  deactivate() {
    super.deactivate()
    this.listeners.forEach(listener => listener.dispose())
  }

  getIds() {
    return Object.keys(this.entities)
  }

  getItem(id: ID) {
    return this.entities[id]
  }

  getAll() {
    return this.getIds().map(id => this.getItem(id))
  }

  /** Select on element of the list */
  select(idOrItem: ID | I) {
    const item = (typeof idOrItem === 'object')
      ? idOrItem
      : this.entities[idOrItem as ID]
    this.treeView.reveal(item, { select: true , focus: true, expand: false })
    this.emit('selected', item)
    this.emit('change', this.getAll())
  }

  /** Reset the entire list */
  reset(items: I[]) {
    this.entities = {}
    items.forEach((item, i) => {
      const id = this.options.idKey ? (item[this.options.idKey] || i) : i
      this.entities[id] = item
    })
    this.list.reset(items)
    this.emit('reset', items)
    this.emit('change', items)
  }

  /** Add a new item to the list */
  add(item: I) {
    const id = item[this.options.idKey]
    this.entities[id] = item
    const all = this.getAll()
    this.list.reset(all)
    this.emit('added', item)
    this.emit('change', all)
  }

  /** Remove one item from the list */
  remove(id: ID) {
    delete this.entities[id]
    const all = this.getAll()
    this.list.reset(all)
    this.emit('removed', id)
    this.emit('change', all)
  }

  /** Update one item in the list */
  update(id: ID, item: Partial<I>) {
    this.entities[id] = { ...this.entities[id], ...item }
    this.emit('updated', this.entities[id])
    this.emit('change', this.getAll())
  }
}

