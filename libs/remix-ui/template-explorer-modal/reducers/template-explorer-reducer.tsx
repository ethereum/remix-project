import React from 'react'
import { TemplateExplorerWizardState, TemplateExplorerWizardSteps } from '../types/template-explorer-types'

const initialState: TemplateExplorerWizardState = {
  steps: TemplateExplorerWizardSteps.SELECT_TEMPLATE,
  workspaceTemplateChosen: '',
  workspaceTemplateGroupChosen: '',
  workspaceName: '',
  defaultWorkspaceName: '',
  topLeftNagivationName: '',
  initializeAsGitRepo: false
}

export const templateExplorerReducer = (state: TemplateExplorerWizardState, action: any) => {
  switch (action.type) {
  case 'SET_TEMPLATE_EXPLORER':
    return action.payload
  }
}
