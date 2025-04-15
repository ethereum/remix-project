
import React from 'react'
import { FormattedMessage } from 'react-intl'
import { CustomTooltip } from "@remix-ui/helper"
import { AppModal } from '@remix-ui/app'
import { ViewPlugin } from '@remixproject/engine-web'
import { PluginViewWrapper } from '@remix-ui/helper'
import { RemixUIGridView } from '@remix-ui/remix-ui-grid-view'
import { RemixUIGridSection } from '@remix-ui/remix-ui-grid-section'
import { RemixUIGridCell } from '@remix-ui/remix-ui-grid-cell'
import isElectron from 'is-electron'
import type { TemplateGroup } from '@remix-ui/workspace'
import './templates-selection-plugin.css'
import { templates } from './templates'

//@ts-ignore
const _paq = (window._paq = window._paq || [])

const profile = {
  name: 'templateSelection',
  displayName: 'Template Selection',
  description: 'templateSelection',
  location: 'mainPanel',
  methods: [],
  events: [],
  maintainedBy: 'Remix',
}

export class TemplatesSelectionPlugin extends ViewPlugin {
  templates: Array<TemplateGroup>
  dispatch: React.Dispatch<any> = () => { }
  opts: any = {}

  constructor() {
    super(profile)
  }

  async onActivation() {
    this.handleThemeChange()
    await this.call('tabs', 'focus', 'templateSelection')
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

    const errorCallback = async (error, data) => {
      if (error) {
        const modal: AppModal = {
          id: 'TemplatesSelection',
          title:  window._intl.formatMessage({ id: !isElectron() ? 'filePanel.workspace.create': 'filePanel.workspace.create.desktop' }),
          message: error.message,
          okLabel: window._intl.formatMessage({ id: 'filePanel.ok' }),
          cancelLabel: window._intl.formatMessage({ id: 'filePanel.cancel' })
        }
        await this.call('notification', 'modal', modal)
        console.error(error)
      }

    }

    const createWorkspace = async (item, templateName: string) => {
      const defaultName = await this.call('filePanel', 'getAvailableWorkspaceName', item.displayName)
      const username = await this.call('settings', 'get', 'settings/github-user-name')
      const email = await this.call('settings', 'get', 'settings/github-email')
      const gitNotSet = !username || !email
      let workspaceName = defaultName
      let initGit = false
      const modal: AppModal = {
        id: 'TemplatesSelection',
        title:  window._intl.formatMessage({ id: !isElectron() ? 'filePanel.workspace.create': 'filePanel.workspace.create.desktop' }),
        message: await createModalMessage(defaultName, gitNotSet, (value) => workspaceName = value, (value) => initGit = !!value, (event) => setCheckBoxRefs(event), (event) => setRadioRefs(event), templateName),
        okLabel: window._intl.formatMessage({ id: !isElectron() ? 'filePanel.ok':'filePanel.selectFolder' }),
      }
      const modalResult = await this.call('notification', 'modal', modal)
      if (!modalResult) return
      _paq.push(['trackEvent', 'template-selection', 'createWorkspace', item.value])
      this.emit('createWorkspaceReducerEvent', workspaceName, item.value, this.opts, false, errorCallback, initGit)
    }

    const addToCurrentWorkspace = async (item) => {
      _paq.push(['trackEvent', 'template-selection', 'addToCurrentWorkspace', item.value])
      this.emit('addTemplateToWorkspaceReducerEvent', item.value, this.opts, false, async (e, data) => {
        if (e) {
          const modal: AppModal = {
            id: 'TemplatesSelection',
            title:  window._intl.formatMessage({ id: !isElectron() ? 'filePanel.workspace.create': 'filePanel.workspace.create.desktop' }),
            message: e.message,
            okLabel: window._intl.formatMessage({ id: 'filePanel.ok' }),
            cancelLabel: window._intl.formatMessage({ id: 'filePanel.cancel' })
          }
          await this.call('notification', 'modal', modal)
          console.error(e)
        } else {
          this.call('notification', 'toast', 'Files Added.')
        }
      })
    }

    const setCheckBoxRefs = (event) => {
      const { value, checked } = event.target
      if (value === 'mintable') {
        this.opts.mintable = checked
      } else if (value === 'burnable') {
        this.opts.burnable = checked
      } else if (value === 'pausable') {
        this.opts.pausable = checked
      }
    }

    const setRadioRefs = (event) => {
      const { value } = event.target
      if (value === 'transparent') {
        this.opts.upgradeable = value
      } else if (value === 'uups') {
        this.opts.upgradeable = value
      }
    }

    return (
      <RemixUIGridView
        plugin={this}
        styleList={""}
        logo='assets/img/bgRemi.webp'
        enableFilter={true}
        showUntagged={true}
        showPin={false}
        tagList={[
          ['Solidity', 'danger'],
          ['ZKP', 'warning'],
          ['ERC20', 'success'],
          ['ERC721', 'secondary'],
          ['ERC1155', 'primary'],
        ]}
        title='Workspace Templates'
        description="Select a template to create a workspace or to add it to current workspace"
      >
        {
          templates(window._intl, this).map(template => {
            return <RemixUIGridSection
              plugin={this}
              key={template.name}
              title={template.name}
              tooltipTitle={template.tooltip}
              hScrollable={false}
            >
              {template.items.map((item, index) => {
                if (!item.opts) {
                  return (
                    <RemixUIGridCell
                      plugin={this}
                      title={item.displayName}
                      key={item.name || index}
                      id={item.name}
                      searchKeywords={[item.displayName, item.description, template.name]}
                      tagList={item.tagList}
                      classList={'TSCellStyle'}
                    >
                      <div className='d-flex justify-content-between h-100 flex-column'>
                        <div className='d-flex flex-column'>
                          <div>
                            {item.description && <span className='text-dark'>{item.description}</span>}
                          </div>
                          <div className='d-flex flex-wrap mb-2'>
                            {(item.opts && item.opts.upgradeable && item.opts.upgradeable === 'uupds') && <span className='badgeForCell badge text-secondary'>Upgradeable-UUPS</span>}
                            {(item.opts && item.opts.mintable) && <span className='badgeForCell text-secondary'>mintable</span>}
                            {(item.opts && item.opts.burnable) && <span className='badgeForCell text-secondary'>burnable</span>}
                            {(item.opts && item.opts.pausable) && <span className='badgeForCell text-secondary'>pausable</span>}
                          </div>
                        </div>
                        <div className='align-items-center justify-content-between w-100 d-flex pt- flex-row'>
                          {(!template.IsArtefact || !item.isArtefact) && <CustomTooltip
                            placement="auto"
                            tooltipId={`overlay-tooltip-new${item.name}`}
                            tooltipText="Create a new workspace"
                          >
                            <span
                              data-id={`create-${item.value}${item.opts ? JSON.stringify(item.opts) : ''}`}
                              onClick={async () => {
                                createWorkspace(item, template.name)
                              }}
                              className="btn btn-sm mr-2 border border-primary"
                            >
                          Create
                            </span>
                          </CustomTooltip>}
                          <CustomTooltip
                            placement="auto"
                            tooltipId={`overlay-tooltip-add${item.name}`}
                            tooltipText="Add template files to current workspace"
                          >
                            <span
                              data-id={`add-${item.value}`}
                              onClick={async () => addToCurrentWorkspace(item)}
                              className="btn btn-sm border"
                            >
                          Add to current
                            </span>
                          </CustomTooltip>
                        </div>
                      </div>
                    </RemixUIGridCell>
                  )
                }
              })}
              { template.name === 'Cookbook' && <RemixUIGridCell
                plugin={this}
                title={"More from Cookbook"}
                key={"cookbookMore"}
                id={"cookBookMore"}
                searchKeywords={["cookbook"]}
                tagList={[]}
                classList='TSCellStyle'
              >
                <div className='d-flex justify-content-between h-100 flex-column'>
                  <span className='pt-4 px-1 h6 text-dark'>{ template.description }</span>
                  <span style={{ cursor: 'pointer' }} className='mt-2 btn btn-sm border align-items-left' onClick={() => template.onClick() }>{ template.onClickLabel }</span>
                </div>
              </RemixUIGridCell> }
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
  onChangeInitGit: (name: string) => void,
  onChangeCheckBoxRefs: (event: any) => void,
  onChangeRadioRefs: (event: any) => void,
  templateName?: string
) => {
  return (
    <>
      <label id="wsName" className="form-check-label" style={{ fontWeight: 'bolder' }}>
        <FormattedMessage id="filePanel.workspaceName" />
      </label>
      <input
        type="text"
        data-id="modalDialogCustomPromptTextCreate"
        defaultValue={defaultName}
        className="form-control mb-3"
        onChange={(e) => onChangeTemplateName(e.target.value)}
        onInput={(e) => onChangeTemplateName((e.target as any).value)}
      />
      {templateName?.includes('OpenZeppelin') ? (
        <div id="ozcustomization" data-id="ozCustomization" style={{ display: 'block' }} className="mb-2">
          <label className="form-check-label d-block mb-2" style={{ fontWeight: 'bolder' }}>
            <FormattedMessage id="filePanel.customizeTemplate" />
          </label>

          <label id="wsName" className="form-check-label d-block mb-1">
            <FormattedMessage id="filePanel.features" />
          </label>
          <div className="mb-2">
            <div className="d-flex ml-2 custom-control custom-checkbox">
              <input className="custom-control-input" type="checkbox" name="feature" value="mintable" id="mintable" onChange={onChangeCheckBoxRefs} />
              <label className="form-check-label custom-control-label" htmlFor="mintable" data-id="featureTypeMintable">
                <FormattedMessage id="filePanel.mintable" />
              </label>
            </div>
            <div className="d-flex ml-2 custom-control custom-checkbox">
              <input className="custom-control-input" type="checkbox" name="feature" value="burnable" id="burnable" onChange={onChangeCheckBoxRefs} />
              <label className="form-check-label custom-control-label" htmlFor="burnable" data-id="featureTypeBurnable">
                <FormattedMessage id="filePanel.burnable" />
              </label>
            </div>
            <div className="d-flex ml-2 custom-control custom-checkbox">
              <input className="custom-control-input" type="checkbox" name="feature" value="pausable" id="pausable" onChange={onChangeCheckBoxRefs} />
              <label className="form-check-label custom-control-label" htmlFor="pausable" data-id="featureTypePausable">
                <FormattedMessage id="filePanel.pausable" />
              </label>
            </div>
          </div>

          <label id="wsName" className="form-check-label d-block mb-1">
            <FormattedMessage id="filePanel.upgradeability" />
          </label>
          <div>
            <div className="d-flex ml-2 custom-control custom-radio">
              <input className="custom-control-input" type="radio" name="upgradeability" value="transparent" id="transparent" onChange={onChangeRadioRefs} />
              <label className="form-check-label custom-control-label" htmlFor="transparent" data-id="upgradeTypeTransparent">
                <FormattedMessage id="filePanel.transparent" />
              </label>
            </div>
            <div className="d-flex ml-2 custom-control custom-radio">
              <input className="custom-control-input" type="radio" name="upgradeability" value="uups" id="uups" onChange={onChangeRadioRefs} />
              <label className="form-check-label custom-control-label" htmlFor="uups" data-id="upgradeTypeUups">
              UUPS
              </label>
            </div>
          </div>
        </div>
      ) : (
        <></>
      )}
      <div className="d-flex py-2 align-items-center custom-control custom-checkbox">
        <input
          id="initGitRepository"
          data-id="initGitRepository"
          className="form-check-input custom-control-input"
          type="checkbox"
          disabled={gitConfigNotSet}
          onChange={(e) => onChangeInitGit(e.target.value)}
          onInput={(e) => onChangeInitGit((e.target as any).value)}
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

