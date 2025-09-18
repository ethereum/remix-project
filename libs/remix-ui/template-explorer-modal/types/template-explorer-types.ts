
export interface TemplateExplorerWizardState {
  steps: TemplateExplorerWizardSteps
  workspaceTemplateChosen: string
  workspaceTemplateGroupChosen: string
  workspaceName: string
  defaultWorkspaceName: string
  topLeftNagivationName: string
  initializeAsGitRepo: boolean
}

export enum TemplateExplorerWizardSteps {
  SELECT_TEMPLATE = 'SELECT_TEMPLATE',
  GENERATE_TEMPLATE = 'GENERATE_TEMPLATE',
  MODIFY_WORKSPACE = 'MODIFY_WORKSPACE',
  REVIEW_WORKSPACE = 'REVIEW_WORKSPACE'
}
