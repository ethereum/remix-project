import { ElectronPlugin } from '@remixproject/engine-electron';

export class GitHubAuthHandler extends ElectronPlugin {
  constructor() {
    console.log('[GitHubAuthHandler] Initializing')
    super({
      displayName: 'githubAuthHandler',
      name: 'githubAuthHandler',
      description: 'githubAuthHandler',
    })
    this.methods = []
  }

  onActivation(): void {
      console.log('[GitHubAuthHandler] Activated')
  }
}