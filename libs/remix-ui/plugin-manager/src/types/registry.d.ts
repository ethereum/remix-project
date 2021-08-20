declare class registry {
  state: {};
  put({ api, name }: {
    api: any;
    name: any;
  }): any

  get(name: any): any;
}
export = registry;
