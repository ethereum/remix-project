import { ElectronPlugin } from '@remixproject/engine-electron';

export class GitHubAuthHandler extends ElectronPlugin {
  constructor() {
    super({
      displayName: 'githubAuthHandler',
      name: 'githubAuthHandler',
      description: 'githubAuthHandler',
    })
    this.methods = []
  }

}
