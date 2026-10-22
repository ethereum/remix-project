import React from 'react'
import { ToolApprovalRequest, ApprovalScope } from '@remix/remix-ai-core'

interface ScreenCaptureConsentCardProps {
  request: ToolApprovalRequest
  /** Display name of the model the image would be sent to. */
  modelName?: string
  onDecide: (scope: ApprovalScope) => void
}

/** Long reasons are the model thinking out loud; the gist is what matters here. */
const REASON_MAX = 140

/**
 * Asks before the assistant photographs the user's screen.
 */
export const ScreenCaptureConsentCard: React.FC<ScreenCaptureConsentCardProps> = ({ request, modelName, onDecide }) => {
  const consent = request.consent
  const model = modelName || consent?.modelName || 'The assistant'
  const wholeIde = consent?.wholeIde !== false
  const target = consent?.targetLabel || 'the whole Remix IDE window'

  const reason = consent?.reason?.trim()
  const shortReason = reason && reason.length > REASON_MAX
    ? `${reason.slice(0, REASON_MAX).trimEnd()}…`
    : reason

  return (
    <div className="tool-approval-card screen-capture-card" data-id="screen-capture-consent-card">
      <div className="tool-approval-card__header">
        <span className="tool-approval-card__tool-name">
          <i className="fas fa-camera me-2" aria-hidden="true"></i>
          Let the assistant see your screen?
        </span>
      </div>

      <div className="screen-capture-card__body">
        {wholeIde ? (
          <p className="mb-1">
            <strong>{model}</strong> wants a picture of your Remix IDE window. It will include the
            code in your open editor tabs, your file names, and this conversation.
          </p>
        ) : (
          <p className="mb-1">
            <strong>{model}</strong> wants a picture of <code>{target}</code> in your Remix IDE,
            including anything visible inside it.
          </p>
        )}
        {shortReason && (
          <p className="screen-capture-card__reason mb-0" data-id="screen-capture-reason">
            Its reason: “{shortReason}”
          </p>
        )}
      </div>

      <div className="tool-approval-card__actions screen-capture-card__actions">
        <button
          onClick={() => onDecide('deny')}
          className="tool-approval-card__btn tool-approval-card__btn--reject"
          data-id="screen-capture-allow-deny"
        >
          Don&apos;t allow
        </button>
        <button
          onClick={() => onDecide('always')}
          className="tool-approval-card__btn tool-approval-card__btn--ghost"
          data-id="screen-capture-allow-always"
        >
          Always allow
        </button>
        <button
          onClick={() => onDecide('session')}
          className="tool-approval-card__btn tool-approval-card__btn--ghost"
          data-id="screen-capture-allow-session"
        >
          Allow for this chat
        </button>
        <button
          onClick={() => onDecide('once')}
          className="tool-approval-card__btn tool-approval-card__btn--approve"
          data-id="screen-capture-allow-once"
        >
          Allow once
        </button>
      </div>
    </div>
  )
}
