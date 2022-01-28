'use strict'
import { ThemeModule } from '../tabs/theme-module'
import { RemixAppManager } from '../../remixAppManager'
import { RemixEngine } from '../../remixEngine'

declare var Registry
// ----------------- theme service ---------------------------------
export class ThemeService {
  public themeModule: ThemeModule
  public appManager: RemixAppManager
  public engine: RemixEngine

  constructor () {
    this.appManager = Registry.get('appManagerRegistry').api
    this.engine = Registry.get('engineRegistry').api
  }

  async activate () {
    this.themeModule = new ThemeModule()
    Registry.put({ api: this.themeModule, name: 'themeModule' })

    this.engine.register([
      this.themeModule
    ])
    await this.appManager.activatePlugin(['theme'])
  }
}
