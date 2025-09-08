/* eslint-disable @nrwl/nx/enforce-module-boundaries */
import { branch, desktopConnection, GitHubUser } from '@remix-api'
import { AppModalCancelTypes, ModalTypes } from '../types'
import { Template, TemplateGroup, TemplateOption } from 'libs/remix-ui/workspace/src/lib/utils/constants'

export type ValidationResult = {
    valid: boolean,
    message?: string
}

export interface AppModal {
    id: string
    timestamp?: number
    hide?: boolean
    title: string | JSX.Element
    validationFn?: (value: string) => ValidationResult
    // eslint-disable-next-line no-undef
    message: string | JSX.Element
    okLabel: string | JSX.Element
    okFn?: (value?:any) => void
    cancelLabel?: string | JSX.Element
    cancelFn?: (reason?: AppModalCancelTypes) => void,
    modalType?: ModalTypes,
    modalParentClass?: string
    defaultValue?: string
    hideFn?: () => void,
    resolve?: (value?:any) => void,
    next?: () => void,
    data?: any,
    showCancelIcon?: boolean,
    preventBlur?: boolean
    placeholderText?: string
}

export interface AlertModal {
    id: string
    title?: string,
    message: string | JSX.Element,
}

export interface ModalState {
    modals: AppModal[],
    toasters: {message: (string | JSX.Element), timestamp: number }[],
    focusModal: AppModal,
    focusToaster: {message: (string | JSX.Element), timestamp: number }
}

export interface forceChoiceModal {
  id: string
  title?: string,
  message: string | JSX.Element,
}

export interface TemplateExplorerModal {
  id: string
  title?: string,
  message: JSX.Element,
  workspaceName: string,
  modifyWorkspaceName: boolean,
  workspaceDescription: string,
  workspaceTemplateOptions: TemplateOption,
  workspaceTemplateGroup: TemplateGroup,
  workspaceTemplate: Template,
  timestamp?: number
  hide?: boolean
  validationFn?: (value: string) => ValidationResult
  // eslint-disable-next-line no-undef
  okLabel: string | JSX.Element
  okFn?: (value?:any) => void
  cancelLabel?: string | JSX.Element
  cancelFn?: (reason?: AppModalCancelTypes) => void,
  modalType?: ModalTypes,
  modalParentClass?: string
  defaultValue?: string
  hideFn?: () => void,
  resolve?: (value?:any) => void,
  next?: () => void,
  data?: any,
  showCancelIcon?: boolean,
  preventBlur?: boolean
  placeholderText?: string
  searchTerm?: string
  workspaceTags?: string[]
  modifyWorkspace?: boolean
}

export interface AppState {
    gitHubUser: GitHubUser
    currentBranch: branch
    needsGitInit: boolean
    canUseGit: boolean
    showPopupPanel: boolean
    connectedToDesktop: desktopConnection
    desktopClientConnected: desktopConnection
}

