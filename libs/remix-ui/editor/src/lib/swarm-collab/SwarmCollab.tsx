import React, { useEffect, useMemo, useRef, useState } from 'react' // eslint-disable-line
import { Room } from '@solarpunkltd/swarm-collaborative-docs'
import type { RoomInvite } from '@solarpunkltd/swarm-collaborative-docs'
import { CollabSession, CollabState, RemixHost } from './collabSession'
import { RemoteCursorDecorations } from './monacoBinding'
import { consumeInviteFromLocation, inviteFromParts, loadActiveSession, loadSettings, parseInviteInput, saveSettings } from './settings'
import { CollabDialogForm, CollabFormData, EMPTY_JOIN_FORM } from './CollabDialogForm'
import { CollabSessionPanel } from './CollabSessionPanel'
import './swarm-collab.css'

export interface SwarmCollabProps {
  /** The editor plugin. */
  plugin: any
  editorRef: React.MutableRefObject<any>
  monacoRef: React.MutableRefObject<any>
  currentFile: string
  /** Hides the controls (e.g. behind the diff view) without ending the session. */
  hidden?: boolean
}

const PHASE_LABEL: Record<CollabState['phase'], string> = { idle: '', connecting: 'Connecting…', syncing: 'Syncing…', live: 'Live' }

function hostFor(plugin: any): RemixHost {
  return {
    call: (name, method, ...args) => plugin.call(name, method, ...args),
    on: (name, event, cb) => plugin.on(name, event, cb),
    off: (name, event) => plugin.off(name, event),
    setForceReadOnly: (value) => plugin.setForceReadOnly?.(value)
  }
}

/** Toolbar button, session panel, and remote cursor rendering; the create/join form lives in the Remix notification modal. */
export const SwarmCollab = ({ plugin, editorRef, monacoRef, currentFile, hidden }: SwarmCollabProps) => {
  const session = useMemo(() => new CollabSession(hostFor(plugin)), [plugin])
  const [state, setState] = useState<CollabState>(session.getState())
  const [panelOpen, setPanelOpen] = useState(false)
  const currentFileRef = useRef(currentFile)
  currentFileRef.current = currentFile
  const codeEditor = editorRef.current
  const modalOpenRef = useRef(false)
  const openModalRef = useRef<(mode: 'create' | 'join', invite?: RoomInvite | null, error?: string | null) => Promise<void>>(null as any)

  useEffect(() => session.subscribe(setState), [session])

  const isCurrentRoom = (invite: RoomInvite) => session.getState().roomId === new Room(invite.key).id

  const openModal = async (initialMode: 'create' | 'join', initialInvite: RoomInvite | null = null, initialError: string | null = null) => {
    if (modalOpenRef.current) return
    modalOpenRef.current = true
    const dataRef: React.MutableRefObject<CollabFormData> = { current: { mode: initialMode, settings: loadSettings(), joinForm: EMPTY_JOIN_FORM } }
    const currentState = session.getState()

    const confirmed = await plugin.call('notification', 'modal', {
      id: 'swarmCollab',
      title: initialMode === 'join' ? 'Join a Swarm collaboration session' : 'Share this workspace over Swarm',
      message: (
        <CollabDialogForm
          dataRef={dataRef}
          initialMode={initialMode}
          initialInvite={initialInvite}
          isActive={currentState.phase !== 'idle'}
          activeWorkspace={currentState.workspace}
          error={initialError}
          plugin={plugin}
        />
      ),
      okLabel: initialMode === 'join' ? 'Join' : 'Start session',
      cancelLabel: 'Cancel',
    })

    if (!confirmed) {
      modalOpenRef.current = false
      return
    }

    const { mode, settings, joinForm } = dataRef.current
    const joining = mode === 'join'
    const pastedInvite = joining && !initialInvite ? parseInviteInput(joinForm.link) : null
    const joinInvite = joining ? initialInvite ?? pastedInvite ?? inviteFromParts(joinForm.key, joinForm.host, settings.transport) : null

    saveSettings(settings)
    try {
      if (!joining) {
        await session.create(settings)
      } else if (joinInvite && !isCurrentRoom(joinInvite)) {
        if (session.getState().phase !== 'idle') await session.leave()
        await session.join(joinInvite, settings)
      }
      setPanelOpen(true)
    } catch (err) {
      const errorMsg = session.getState().error
      session.dismissError()
      modalOpenRef.current = false
      await openModal(mode, initialInvite, errorMsg ?? (err as Error).message)
    } finally {
      modalOpenRef.current = false
    }
  }

  // Keep a stable ref so the async-error effect always calls the latest openModal.
  openModalRef.current = openModal

  // DOC_ERROR fires asynchronously (after session.create/join resolved), so the try/catch in openModal
  // never sees it. Watch state.error here and re-open the modal when it appears.
  // Async errors (DOC_ERROR fires after session.create/join resolved) — open the panel so
  // CollabSessionPanel can display them. The user dismisses via the ✕ or leaves the session.
  useEffect(() => {
    if (!state.error) return
    setPanelOpen(true)
  }, [state.error])

  // An invite in the URL opens the join modal, otherwise this tab's session resumes. No leave on unmount: the editor lives as long as the page.
  useEffect(() => {
    const offer = (invite: RoomInvite) => {
      if (isCurrentRoom(invite)) setPanelOpen(true)
      else openModal('join', invite)
    }

    const invite = consumeInviteFromLocation()
    const active = loadActiveSession()
    if (invite) {
      offer(invite)
    } else if (active) {
      session.resume(active, loadSettings()).catch(() => setPanelOpen(true))
    }

    const onHashChange = () => {
      const next = consumeInviteFromLocation()
      if (next) offer(next)
    }
    window.addEventListener('hashchange', onHashChange)
    return () => window.removeEventListener('hashchange', onHashChange)
  }, [session])

  // Bind the model the editor shows for the current file.
  useEffect(() => {
    const monaco = monacoRef.current
    if (!monaco || !currentFile) return session.setActiveFile(null, null)

    const uri = monaco.Uri.parse(currentFile)
    const bind = () => session.setActiveFile(currentFile, monaco.editor.getModel(uri))
    bind()
    const created = monaco.editor.onDidCreateModel((model: any) => {
      if (model.uri.toString() === uri.toString()) bind()
    })

    return () => created.dispose()
  }, [currentFile, state.phase, monacoRef.current])

  // Local caret out, remote carets in.
  useEffect(() => {
    if (!codeEditor || state.phase !== 'live') return

    const decorations = new RemoteCursorDecorations(codeEditor)
    const render = () => decorations.render(session.cursorsFor(currentFileRef.current))
    const offCursors = session.onCursorsChanged(render)
    const selection = codeEditor.onDidChangeCursorSelection((e: any) => {
      const model = codeEditor.getModel()
      if (!model) return

      const anchor = model.getOffsetAt({ lineNumber: e.selection.selectionStartLineNumber, column: e.selection.selectionStartColumn })
      const head = model.getOffsetAt({ lineNumber: e.selection.positionLineNumber, column: e.selection.positionColumn })
      session.updateLocalCursor(currentFileRef.current, anchor, head)
    })
    const modelChange = codeEditor.onDidChangeModel(render)
    render()

    return () => {
      offCursors()
      selection.dispose()
      modelChange.dispose()
      decorations.dispose()
    }
  }, [codeEditor, state.phase, session])

  const active = state.phase !== 'idle'
  const connectedPeople = state.people.filter((p) => p.connected).length

  return (
    <div className={`swarm-collab-root${hidden ? ' d-none' : ''}`}>
      <div className="swarm-collab-toolbar">
        {active ? (
          <button className="btn btn-sm btn-secondary" onClick={() => setPanelOpen(!panelOpen)} data-id="swarmCollabStatus" title="Swarm collaboration session">
            <span className={`swarm-collab-dot ${state.phase === 'live' ? 'swarm-collab-dot-live' : ''}`} />
            {PHASE_LABEL[state.phase]}
            {state.phase === 'live' && ` · ${connectedPeople} connected`}
            {state.saving && <i className="fas fa-cloud-upload-alt ms-2" title="Saving to Swarm" />}
          </button>
        ) : (
          <button className="btn btn-secondary swarm-collab-fab" onClick={() => openModal('create')} data-id="swarmCollabStart" title="Collaborate on this workspace over Swarm">
            <i className="fas fa-users" />
          </button>
        )}
      </div>

      {active && panelOpen && (
        <CollabSessionPanel state={state} onLeave={() => session.leave()} onDismissError={() => session.dismissError()} />
      )}
    </div>
  )
}
