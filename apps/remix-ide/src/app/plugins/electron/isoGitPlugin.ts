import { ElectronPlugin } from '@remixproject/engine-electron';

export class isoGitPlugin extends ElectronPlugin {
  constructor() {
    super({
      displayName: 'isogit',
      name: 'isogit',
      description: 'isogit',
    })
    this.methods = []
    
  }

  async onActivation(): Promise<void> {

    setTimeout(async () => {
      const version = await this.call('isogit', 'version')
      if(version){
      //this.call('terminal', 'log', version)
      }else{
      //this.call('terminal', 'log', 'Git is not installed on the system. Using builtin git instead. Performance will be affected. It is better to install git on the system and configure the credentials to connect to GitHub etc.')
      }
  
  
    }, 5000)
  }


}