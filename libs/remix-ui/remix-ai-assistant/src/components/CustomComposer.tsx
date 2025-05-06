import { className as compComposerClassName } from '@shared/components/Composer/create'
import { ComposerStatus } from '@shared/components/Composer/props'
import {
  statusClassName as compComposerStatusClassName,
} from '@shared/components/Composer/utils/applyNewStatusClassName'
import { isSubmitShortcutKey } from '@shared/utils/isSubmitShortcutKey'
import { ChangeEvent, KeyboardEvent, ReactElement, useEffect, useMemo, useRef } from 'react'
import { CancelIconComp } from '../../components/CancelIcon/CancelIconComp'
import { SendIconComp } from '../../components/SendIcon/SendIconComp'

const submittingPromptStatuses: Array<ComposerStatus> = [
  'submitting-prompt',
  'submitting-edit',
  'submitting-conversation-starter',
  'submitting-external-message',
]

export type ComposerStatus =
    'typing'
    | 'submitting-prompt'
    | 'submitting-conversation-starter'
    | 'submitting-edit'
    | 'submitting-external-message'
    | 'waiting';

/**
 * Options for the Composer DOM component.
 */
export type ComposerPropsDOM = {
    status: ComposerStatus
    message?: string
    placeholder?: string
    autoFocus?: boolean

    /**
     * This will override the disabled state of the submit button when the composer is in 'typing' status.
     * It will not have any impact in the composer 'submitting-prompt', 'submitting-conversation-starter',
     * 'submitting-external-message', and 'waiting' statuses, as the submit button is always disabled in
     * these statuses.
     *
     * Default: Submit button is only enabled when the message is not empty.
     */
    disableSubmitButton?: boolean

    /**
     * The shortcut to submit the prompt message.
     *
     * - `Enter`: The user can submit the prompt message by pressing the `Enter` key. In order to add a new line, the
     * user can press `Shift + Enter`.
     * - `CommandEnter`: When this is used, the user can submit the prompt message by pressing `Ctrl + Enter` on
     * Windows/Linux or `Cmd + Enter` on macOS. In order to add a new line, the user can press `Enter`.
     *
     * @default 'Enter'
     */
    submitShortcut?: 'Enter' | 'CommandEnter'
}

export type ComposerProps = {

  // State and option props
  status: ComposerStatus
  prompt?: string
  placeholder?: string
  autoFocus?: boolean
  hideStopButton?: boolean

  hasValidInput?: boolean
  submitShortcut?: 'Enter' | 'CommandEnter'

  // Event Handlers
  onChange: (value: string) => void
  onSubmit: () => void
  onCancel: () => void

  // UI Overrides
  Loader: ReactElement
}

export const ComposerComp = (props: ComposerProps) => {
  const compClassNameFromStats = compComposerStatusClassName[props.status] || ''
  const className = `${compComposerClassName} ${compClassNameFromStats}`

  const disableTextarea = submittingPromptStatuses.includes(props.status)
  const disableButton = !props.hasValidInput || props.status === 'waiting' || submittingPromptStatuses.includes(
    props.status)
  const showSendIcon = props.status === 'typing' || props.status === 'waiting'
  const hideCancelButton = props.hideStopButton === true
  const showCancelButton = !hideCancelButton && (submittingPromptStatuses.includes(props.status) || props.status
        === 'waiting')

  const textareaRef = useRef<HTMLTextAreaElement>(null)
  useEffect(() => {
    if (props.status === 'typing' && props.autoFocus && textareaRef.current) {
      textareaRef.current.focus()
    }
  }, [props.status, props.autoFocus, textareaRef.current])

  const handleChange = useMemo(() => (e: ChangeEvent<HTMLTextAreaElement>) => {
    props.onChange?.(e.target.value)
  }, [props.onChange])

  const handleSubmit = useMemo(() => () => {
    props.onSubmit?.()
  }, [props.onSubmit])

  const handleKeyDown = useMemo(() => (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (isSubmitShortcutKey(e, props.submitShortcut)) {
      e.preventDefault()
      handleSubmit()
    }
  }, [handleSubmit, props.submitShortcut])

  useEffect(() => {
    if (!textareaRef.current) {
      return
    }
    const adjustHeight = () => {
      const textarea = textareaRef.current
      if (textarea) {
        textarea.style.height = 'auto' // Reset height
        textarea.style.height = `${textarea.scrollHeight}px` // Set new height based on content
      }
    }
    textareaRef.current.addEventListener('input', adjustHeight)
    return () => {
      textareaRef.current?.removeEventListener('input', adjustHeight)
    }

  }, [textareaRef.current])

  return (
    <div className={className}>
      <textarea
        tabIndex={0}
        ref={textareaRef}
        disabled={disableTextarea}
        placeholder={props.placeholder}
        value={props.prompt}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        aria-label={props.placeholder}
      />
      {!showCancelButton && (
        <button
          tabIndex={0}
          disabled={disableButton}
          onClick={() => props.onSubmit()}
          aria-label="Send"
        >
          {showSendIcon && <SendIconComp/>}
          {!showSendIcon && props.Loader}
        </button>
      )}
      {showCancelButton && (
        <button
          tabIndex={0}
          onClick={props.onCancel}
          aria-label="Cancel"
        >
          <CancelIconComp/>
        </button>
      )}
    </div>
  )
}