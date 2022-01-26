'use strict'
import { ThemeModule } from '../tabs/theme-module'
import Registry from '../state/registry'
import { RemixAppManager } from '../../remixAppManager'
import { RemixEngine } from '../../remixEngine'

export class ThemeService {
  private registry: Registry
  public themeModule: ThemeModule

  constructor () {
    this.registry = Registry.getInstance()
  }

  async activate () {
    const appManager: RemixAppManager = this.registry.get('appManagerRegistry').api
    const engine: RemixEngine = this.registry.get('engineRegistry').api
    // ----------------- theme service ---------------------------------
    this.themeModule = new ThemeModule()
    this.registry.put({ api: this.themeModule, name: 'themeModule' })

    engine.register([
      this.themeModule
    ])
    await appManager.activatePlugin(['theme'])
  }
}
