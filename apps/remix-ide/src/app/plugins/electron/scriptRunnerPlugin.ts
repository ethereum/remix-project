import { AppModal } from '@remix-ui/app';
import { ElectronPlugin } from '@remixproject/engine-electron';


export class scriptRunnerPlugin extends ElectronPlugin {
  constructor(){
    super({
      displayName: 'scriptRunner',
      name: 'scriptRunner',
      description: 'scriptRunner'
    })
  }

  async onActivation(): Promise<void> {
    this.on('scriptRunner', 'missingModule', async (module: string) => {
      console.log('missingModule', module)
      const addModuleModal: AppModal = {
        id: 'AddModuleModal',
        title: `Missing module ${module}`,
        message: `Do you want to install the missing module? ${module} \n\nYou can also install it manually using the terminal if you have yarn or npm installed:\nyarn add ${module}`,
        okLabel: 'Install',
        cancelLabel: 'No',
      }
      const result = await this.call('notification', 'modal', addModuleModal)
      if (result) {
        await this.addModule(module)
      }
    })
  }

  async addModule(module: string, version: string = ''): Promise<void> {
    await this.checkPackageJson()
    await this.call('scriptRunner', 'yarnAdd', module, version)
  }

  async checkPackageJson(): Promise<void> {
    const exists = await this.call('fileManager', 'exists', 'package.json')
    if(!exists){
      const initPackageJsonModal: AppModal = {
        id: 'InitPackageJsonModal',
        title: `Missing package.json`,
        message: `A package.json file is required to install the missing module. A package.json file contains meta data about your app or module. Do you want to create one?`,
        okLabel: 'Yes, create a package.json file',
        cancelLabel: 'No',
      }
      const result = await this.call('notification', 'modal', initPackageJsonModal)
      if (result) {
        await this.call('scriptRunner', 'yarnInit')
      }
    }
  }
}