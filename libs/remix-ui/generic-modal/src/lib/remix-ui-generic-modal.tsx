import React from 'react'
import './remix-ui-generic-modal.css'
import { appActionTypes, AppState } from '@remix-ui/app'
import { TopCard, TopCardProps } from '../components/topCard'
import { TemplateExplorerBody } from '../components/template-explorer-body'

export interface RemixUiGenericModalProps {
  dispatch: any
  appState: AppState
  plugin: any
}

const topCards: TopCardProps[] = [
  {
    title: 'Create blank',
    description: 'Create an empty workspace',
    icon: 'fa-solid fa-plus',
    onClick: () => alert('Create blank'),
    importWorkspace: false
  },
  {
    title: 'Create with AI',
    description: 'Generate a workspace with AI',
    icon: 'assets/img/remixai-logoDefault.webp',
    onClick: () => alert('Create with AI'),
    importWorkspace: false
  },
  {
    title: 'Import Project',
    description: 'Import an existing project',
    icon: 'fas fa-upload',
    onClick: () => alert('Import Project'),
    importWorkspace: true
  }

]

export function RemixUiGenericModal (props: RemixUiGenericModalProps) {

  return (
    <section className="generic-modal-background" style={{ zIndex: 8888 }}>
      <div className="generic-modal-container border bg-dark p-2" style={{ width: props.appState.genericModalState.width, height: props.appState.genericModalState.height }}>
        <div className="generic-modal-close-container bg-dark">
          <button className="generic-modal-close-button" onClick={() => props.dispatch({ type: appActionTypes.showGenericModal, payload: false })}>
            <i className="fa-solid fa-xmark"></i>
          </button>
        </div>
        <TemplateExplorerBody topCards={topCards} plugin={props.plugin} />
        <div className="footer">
          {props.appState.genericModalState.footer && props.appState.genericModalState.footer}
        </div>
      </div>
    </section>
  )
}
