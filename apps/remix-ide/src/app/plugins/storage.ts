import { Plugin } from '@remixproject/engine';

const profile = {
  name: 'storage',
  displayName: 'Storage',
  description: 'Storage',
  methods: ['getStorage']
};

export class StoragePlugin extends Plugin {
  constructor() {
    super(profile);
  }

  async getStorage() {
    if ('storage' in navigator && 'estimate' in navigator.storage) {
        return  navigator.storage.estimate()
    } else {
        throw new Error("Can't get storage quota");
    }
  }
}
