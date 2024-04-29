
import React from 'react'
import { FormattedMessage, useIntl } from 'react-intl'
import { AppModal } from '@remix-ui/app'
import { ViewPlugin } from '@remixproject/engine-web'
import { PluginViewWrapper } from '@remix-ui/helper'
import { RemixUIGridView } from '@remix-ui/remix-ui-grid-view'
import { RemixUIGridSection } from '@remix-ui/remix-ui-grid-section'
import { RemixUIGridCell } from '@remix-ui/remix-ui-grid-cell'
import type { TemplateGroup } from '@remix-ui/workspace'

const isElectron = require('is-electron')

//@ts-ignore
const _paq = (window._paq = window._paq || [])

const profile = {
  name: 'templateSelection',
  displayName: 'Template Selection',
  description: 'templateSelection',
  location: 'mainPanel',
  methods: [],
  events: []
}

export class TemplatesSelection extends ViewPlugin {
  templates: Array<TemplateGroup>
  dispatch: React.Dispatch<any> = () => { }
  constructor() {
    super(profile)
  }

  async onActivation() {
    this.handleThemeChange()
    await this.call('tabs', 'focus', 'remixGuide')
    this.renderComponent()
    _paq.push(['trackEvent', 'plugin', 'activated', 'remixGuide'])
  }

  onDeactivation(): void {
  }

  private handleThemeChange() {
    this.on('theme', 'themeChanged', (theme: any) => {
      this.renderComponent()
    })
  }

  setDispatch(dispatch: React.Dispatch<any>): void {
    this.dispatch = dispatch
    this.renderComponent()
  }

  render() {
    return (
      <div className="bg-dark" id="remixGuide">
        <PluginViewWrapper plugin={this} />
      </div>
    )
  }

  renderComponent() {
    this.dispatch({
      ...this,
    })
  }

  updateComponent() {
    /*
    const opts = {
      // @ts-ignore: Object is possibly 'null'.
      mintable: mintableCheckboxRef.current.checked,
      // @ts-ignore: Object is possibly 'null'.
      burnable: burnableCheckboxRef.current.checked,
      // @ts-ignore: Object is possibly 'null'.
      pausable: pausableCheckboxRef.current.checked,
      // @ts-ignore: Object is possibly 'null'.
      upgradeable: transparentRadioRef.current.checked ? transparentRadioRef.current.value : uupsRadioRef.current.checked ? uupsRadioRef.current.value : false
    }
    */
    this.templates = [
      {
        name: "Generic",
        items: [
          { value: "remixDefault", displayName: window._intl.formatMessage({ id: 'filePanel.basic' }) },
          { value: "blank", displayName: window._intl.formatMessage({ id: 'filePanel.blank' }) }
        ]
      },
      {
        name: "OpenZeppelin",
        items: [
          {
            value: "ozerc20",
            displayName: "ERC20"
          },
          {
            value: "ozerc721",
            displayName: "ERC721 (NFT)"
          },
          {
            value: "ozerc1155",
            displayName: "ERC1155"
          },
          {
            value: "ozerc20",
            displayName: "ERC20",
            opts: {
              mintable: true
            }
          },
          {
            value: "ozerc721",
            displayName: "ERC721 (NFT)",
            opts: {
              mintable: true
            }
          },
          {
            value: "ozerc1155",
            displayName: "ERC1155",
            opts: {
              mintable: true
            }
          },
          {
            value: "ozerc20",
            displayName: "ERC20",
            opts: {
              mintable: true,
              burnable: true
            }
          },
          {
            value: "ozerc721",
            displayName: "ERC721 (NFT)",
            opts: {
              mintable: true,
              burnable: true
            }
          },
          {
            value: "ozerc1155",
            displayName: "ERC1155",
            opts: {
              mintable: true,
              burnable: true
            }
          },
          {
            value: "ozerc20",
            displayName: "ERC20",
            opts: {
              mintable: true,
              pausable: true
            }
          },
          {
            value: "ozerc721",
            displayName: "ERC721 (NFT)",
            opts: {
              mintable: true,
              pausable: true
            }
          },
          {
            value: "ozerc1155",
            displayName: "ERC1155",
            opts: {
              mintable: true,
              pausable: true
            }
          }
        ]
      },
      {
        name: "OpenZeppelin Proxy",
        items: [
          {
            value: "ozerc20",
            displayName: "ERC20",
            opts: {
              upgradeable: 'uups'
            }
          },
          {
            value: "ozerc721",
            displayName: "ERC721 (NFT)",
            opts: {
              upgradeable: 'uups'
            }
          },
          {
            value: "ozerc1155",
            displayName: "ERC1155",
            opts: {
              upgradeable: 'uups'
            }
          },
          {
            value: "ozerc20",
            displayName: "ERC20",
            opts: {
              upgradeable: 'uups',
              mintable: true
            }
          },
          {
            value: "ozerc721",
            displayName: "ERC721 (NFT)",
            opts: {
              upgradeable: 'uups',
              mintable: true
            }
          },
          {
            value: "ozerc1155",
            displayName: "ERC1155",
            opts: {
              upgradeable: 'uups',
              mintable: true
            }
          },
          {
            value: "ozerc20",
            displayName: "ERC20",
            opts: {
              upgradeable: 'uups',
              mintable: true,
              burnable: true
            }
          },
          {
            value: "ozerc721",
            displayName: "ERC721 (NFT)",
            opts: {
              upgradeable: 'uups',
              mintable: true,
              burnable: true
            }
          },
          {
            value: "ozerc1155",
            displayName: "ERC1155",
            opts: {
              upgradeable: 'uups',
              mintable: true,
              burnable: true
            }
          },
          {
            value: "ozerc20",
            displayName: "ERC20",
            opts: {
              upgradeable: 'uups',
              mintable: true,
              pausable: true
            }
          },
          {
            value: "ozerc721",
            displayName: "ERC721 (NFT)",
            opts: {
              upgradeable: 'uups',
              mintable: true,
              pausable: true
            }
          },
          {
            value: "ozerc1155",
            displayName: "ERC1155",
            opts: {
              upgradeable: 'uups',
              mintable: true,
              pausable: true
            }
          },
          {
            value: "ozerc1155",
            displayName: "ERC1155",
            opts: {
              upgradeable: 'uups',
              mintable: true,
              burnable: true,
              pausable: true
            }
          }
        ]
      },
      {
        name: "OxProject",
        items: [
          { value: "zeroxErc20", displayName: "ERC20" }
        ]
      },
      {
        name: "Gnosis Safe",
        items: [
          { value: "gnosisSafeMultisig", displayName: window._intl.formatMessage({ id: 'filePanel.multiSigWallet' }) }
        ]
      },
      {
        name: "Circom ZKP",
        items: [
          { value: "semaphore", displayName: window._intl.formatMessage({ id: 'filePanel.semaphore' }) },
          { value: "hashchecker", displayName: window._intl.formatMessage({ id: 'filePanel.hashchecker' }) },
          { value: "rln", displayName: window._intl.formatMessage({ id: 'filePanel.rln' }) }
        ]
      },
      {
        name: "Generic ZKP",
        items: [
          { value: "sindriScripts", displayName: window._intl.formatMessage({ id: 'filePanel.addscriptsindri' }) },
        ]
      },
      {
        name: "Uniswap V4",
        items: [
          { value: "uniswapV4Template", displayName: window._intl.formatMessage({ id: 'filePanel.uniswapV4Template' }) },
          { value: "breakthroughLabsUniswapv4Hooks", displayName: window._intl.formatMessage({ id: 'filePanel.breakthroughLabsUniswapv4Hooks' }) },
          { value: "uniswapV4HookBookMultiSigSwapHook", displayName: window._intl.formatMessage({ id: 'filePanel.uniswapV4HookBookMultiSigSwapHook' }) }
        ]
      },
      {
        name: "Solidity CREATE2",
        items: [
          { value: "contractCreate2Factory", displayName: window._intl.formatMessage({ id: 'filePanel.addcreate2solidityfactory' }) },
          { value: "contractDeployerScripts", displayName: window._intl.formatMessage({ id: 'filePanel.addscriptdeployer' }) }
        ]
      },
      {
        name: "Contract Verification",
        items: [
          { value: "etherscanScripts", displayName: window._intl.formatMessage({ id: 'filePanel.addscriptetherscan' }) },
        ]
      }
    ]

    const createWorkspace = async (item) => {
      const defaultName = await this.call('filePanel', 'getAvailableWorkspaceName', item.displayName)

      const username = await this.call('settings', 'get', 'settings/github-user-name')
      const email = await this.call('settings', 'get', 'settings/github-email')
      const gitNotSet = !username || !email
      let workspaceName = defaultName
      let initGit = true
      const modal: AppModal = {
        id: 'TemplatesSelection',
        title:  window._intl.formatMessage({ id: !isElectron() ? 'filePanel.workspace.create': 'filePanel.workspace.create.desktop' }),
        message: await createModalMessage(defaultName, gitNotSet, (value) => workspaceName = value, (value) => initGit = !!value),
        okLabel: window._intl.formatMessage({ id: !isElectron() ? 'filePanel.ok':'filePanel.selectFolder' }),
      }
      const modalResult = await this.call('notification', 'modal', modal)
      if (!modalResult) return
      this.emit('createWorkspaceReducerEvent', workspaceName, item.value, item.opts, false, (e, data) => {
        if (e) {
          const modal: AppModal = {
            id: 'TemplatesSelection',
            title:  window._intl.formatMessage({ id: !isElectron() ? 'filePanel.workspace.create': 'filePanel.workspace.create.desktop' }),
            message: e.message,
            okLabel: window._intl.formatMessage({ id: 'filePanel.ok' }),
            cancelLabel: window._intl.formatMessage({ id: 'filePanel.cancel' })
          }
          this.call('notification', 'modal', modal)
          console.error(e)
        }

      }, initGit)
    }

    const addToExistingWorkspace = async (item) => {
      this.emit('addTemplateToWorkspaceReducerEvent', item.value, item.opts, false, (e, data) => {
        if (e) {
          const modal: AppModal = {
            id: 'TemplatesSelection',
            title:  window._intl.formatMessage({ id: !isElectron() ? 'filePanel.workspace.create': 'filePanel.workspace.create.desktop' }),
            message: e.message,
            okLabel: window._intl.formatMessage({ id: 'filePanel.ok' }),
            cancelLabel: window._intl.formatMessage({ id: 'filePanel.cancel' })
          }
          this.call('notification', 'modal', modal)
          console.error(e)
        }

      })
    }

    return (
      <RemixUIGridView
        plugin={this}
        styleList={""}
        logo='/assets/img/YouTubeLogo.webp'
        enableFilter={true}
        showUntagged={true}
        showPin={false}
        tagList={[]}
        title='Remix Guide'
        description="Template Selection"
      >
        {

          this.templates.map(template => {
            return <RemixUIGridSection
              plugin={this}
              title={template.name}
              hScrollable= {true}
            >
              {template.items.map(item => {
                return <RemixUIGridCell
                  plugin={this}
                  title={item.displayName}
                >
                  <div>
                    {item.displayName}
                    {JSON.stringify(item.opts)}
                    <div><button data-id={`create-${item.value}${item.opts ? JSON.stringify(item.opts) : ''}`} onClick={async () => createWorkspace(item)} className="btn btn-secondary" >Create a new workspace</button><button data-id={`add-${item.value}`} onClick={async () => addToExistingWorkspace(item)} className="btn btn-primary" >Add to existing workspace</button></div>
                  </div>
                </RemixUIGridCell>
              })}
            </RemixUIGridSection>
          })}
      </RemixUIGridView>
    )
  }

}

const createModalMessage = async (
  defaultName: string,
  gitConfigNotSet: boolean,
  onChangeTemplateName: (name: string) => void,
  onChangeInitGit: (name: string) => void) => {

  return (
    <>
      <label id="wsName" className="form-check-label" style={{ fontWeight: 'bolder' }}>
        <FormattedMessage id="filePanel.workspaceName" />
      </label>
      <input
        type="text"
        data-id="modalDialogCustomPromptTextCreate"
        defaultValue={defaultName}
        className="form-control"
        onChange={(e) => onChangeTemplateName(e.target.value)}
      />
      <div className="d-flex py-2 align-items-center custom-control custom-checkbox">
        <input
          id="initGitRepository"
          data-id="initGitRepository"
          className="form-check-input custom-control-input"
          type="checkbox"
          disabled={gitConfigNotSet}
          onChange={(e) => onChangeInitGit(e.target.value)}
        />
        <label
          htmlFor="initGitRepository"
          data-id="initGitRepositoryLabel"
          className="m-0 form-check-label custom-control-label udapp_checkboxAlign"
          title={window._intl.formatMessage({ id: 'filePanel.initGitRepoTitle' })}
        >
          <FormattedMessage id="filePanel.initGitRepositoryLabel" />
        </label>
      </div>
      {gitConfigNotSet ? (
        <div className="text-warning">
          <FormattedMessage id="filePanel.initGitRepositoryWarning" />
        </div>
      ) : (
        <></>
      )}
    </>
  )
}

