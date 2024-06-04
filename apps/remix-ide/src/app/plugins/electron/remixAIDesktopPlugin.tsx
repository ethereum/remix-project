import { ElectronPlugin } from '@remixproject/engine-electron'

const desktop_profile = {
  name: 'remixAID',
  displayName: 'RemixAI Desktop',
  maintainedBy: 'Remix',
  description: 'RemixAI provides AI services to Remix IDE Desktop.',
  methods: [''],
}

export class remixAIDesktopPlugin extends ElectronPlugin {
  constructor() {
    console.log('remixAIDesktopPlugin')
    super(desktop_profile)
  }

  onActivation(): void {
    this.on('remixAI', 'enabled', () => {console.log('someone enable the remixAI desktop plugin')} )
  }
  
}
