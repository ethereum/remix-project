import React, { useState } from 'react'
import { CustomTooltip } from '@remix-ui/helper'
import { MatomoEvent, AIEvent } from '@remix-api'

interface FloatingActionButtonProps {
  onEditWithAI: () => void
  onExplainContract: () => void
  onCreateDapp: () => void
  onSecurityAudit: () => void
  onGasAudit: () => void
  currentFileExt?: string
  trackEvent?: <T extends MatomoEvent>(event: T) => void
}

export const FloatingActionButton: React.FC<FloatingActionButtonProps> = ({
  onEditWithAI,
  onExplainContract,
  onCreateDapp,
  onSecurityAudit,
  onGasAudit,
  currentFileExt,
  trackEvent
}) => {
  const [isExpanded, setIsExpanded] = useState(false)

  const toggleExpand = () => {
    const newState = !isExpanded
    setIsExpanded(newState)

    // Track FAB button toggle
    if (trackEvent) {
      trackEvent<AIEvent>({
        category: 'ai',
        action: 'remixAI',
        name: newState ? 'fab_expanded' : 'fab_collapsed',
        isClick: true
      })
    }
  }

  const getExplainLabel = () => {
    if (['sol', 'vy', 'circom'].includes(currentFileExt || '')) return 'Explain contract'
    if (['js', 'ts'].includes(currentFileExt || '')) return 'Explain script'
    return 'Explain file'
  }

  const getExplainTooltip = () => {
    if (['sol', 'vy', 'circom'].includes(currentFileExt || '')) return 'Get AI explanation of your contract'
    if (['js', 'ts'].includes(currentFileExt || '')) return 'Get AI explanation of your script'
    return 'Get AI explanation of your file'
  }

  return (
    <div className="fab-container">
      {isExpanded && (
        <div className="fab-menu">
          <CustomTooltip placement="left" tooltipText="Edit your code with AI assistance">
            <button
              className="fab-menu-item"
              onClick={() => {
                if (trackEvent) {
                  trackEvent<AIEvent>({
                    category: 'ai',
                    action: 'remixAI',
                    name: 'fab_edit_with_ai',
                    isClick: true
                  })
                }
                onEditWithAI()
                setIsExpanded(false)
              }}
            >
              <i className="fas fa-edit"></i>
              <span className="fab-menu-text">Edit with AI</span>
            </button>
          </CustomTooltip>
          <CustomTooltip placement="left" tooltipText={getExplainTooltip()}>
            <button
              className="fab-menu-item"
              onClick={() => {
                if (trackEvent) {
                  trackEvent<AIEvent>({
                    category: 'ai',
                    action: 'remixAI',
                    name: 'fab_explain_contract',
                    isClick: true
                  })
                }
                onExplainContract()
                setIsExpanded(false)
              }}
            >
              <i className="fas fa-file-contract"></i>
              <span className="fab-menu-text">{getExplainLabel()}</span>
            </button>
          </CustomTooltip>
          <CustomTooltip placement="left" tooltipText="Generate a frontend from your contract">
            <button
              className="fab-menu-item"
              onClick={() => {
                if (trackEvent) {
                  trackEvent<AIEvent>({
                    category: 'ai',
                    action: 'remixAI',
                    name: 'fab_create_dapp',
                    isClick: true
                  })
                }
                onCreateDapp()
                setIsExpanded(false)
              }}
            >
              <i className="fas fa-rocket"></i>
              <span className="fab-menu-text">Generate Frontend</span>
            </button>
          </CustomTooltip>
          <CustomTooltip placement="left" tooltipText="AI-powered security audit: scans your contract for vulnerabilities and security risks">
            <button
              className="fab-menu-item"
              onClick={() => {
                if (trackEvent) {
                  trackEvent<AIEvent>({
                    category: 'ai',
                    action: 'remixAI',
                    name: 'fab_security_audit',
                    isClick: true
                  })
                }
                onSecurityAudit()
                setIsExpanded(false)
              }}
            >
              <i className="fas fa-shield-alt"></i>
              <span className="fab-menu-text">Security Audit</span>
            </button>
          </CustomTooltip>
          <CustomTooltip placement="left" tooltipText="AI-powered gas audit: analyzes your contract for gas inefficiencies and optimization opportunities">
            <button
              className="fab-menu-item"
              onClick={() => {
                if (trackEvent) {
                  trackEvent<AIEvent>({
                    category: 'ai',
                    action: 'remixAI',
                    name: 'fab_gas_audit',
                    isClick: true
                  })
                }
                onGasAudit()
                setIsExpanded(false)
              }}
            >
              <i className="fas fa-gas-pump"></i>
              <span className="fab-menu-text">Gas Audit</span>
            </button>
          </CustomTooltip>
        </div>
      )}
      <CustomTooltip placement="left" tooltipText="Show AI tools" hide={isExpanded}>
        <button
          className={`fab-main-button ${isExpanded ? 'fab-expanded' : ''}`}
          onClick={toggleExpand}
        >
          {isExpanded ? (
            <i className="fas fa-times"></i>
          ) : (
            <img src="assets/img/remixai-logoAI.svg" alt="AI tools" className="fab-ai-logo" />
          )}
        </button>
      </CustomTooltip>
    </div>
  )
}
