import { ElectronBasePluginClient } from "@remixproject/plugin-electron";
import { Profile } from "@remixproject/plugin-utils";

export class ElectronBasePluginRemixdClient extends ElectronBasePluginClient {
    log: (...message: any) => void
    error: (...message: any) => void
  
    currentSharedFolder: string = ''
    constructor(webContentsId: number, profile: Profile) {
      super(webContentsId, profile);
      this.log = (...message: any) => {
        for(const m of message) {
          this.call('terminal', 'log', {
            type: 'log',
            value: m
          })
        }
      }
      this.error = (...message: any) => {
        for(const m of message) {
          this.call('terminal', 'log', {
            type: 'error',
            value: m
          })
        }
      }
  
  
      this.onload(async () => {
        this.on('fs' as any, 'workingDirChanged', async (path: string) => {
          console.log('workingDirChanged base remixd', path)
          this.currentSharedFolder = path
        })
        this.currentSharedFolder = await this.call('fs' as any, 'getWorkingDir')
      })
    }
  }