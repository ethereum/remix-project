import { remixAILogger } from '../../helpers/logger'
import { ApprovalScope, ScreenCapturePolicy } from '../../types/humanInTheLoop'

/**
 * Remembers whether the user has agreed to let the assistant photograph their
 * screen.
 *
 * Only the *in-memory* half of the decision lives here. "Always allow" and
 * "Never allow" are persisted in settings and read back fresh every time, so
 * the Settings dropdown stays the single source of truth — a stale mirror here
 * would let the UI and the gate disagree about something the user cares about.
 *
 * Scoping follows the thread, the same key `screenshotBuffer` uses: "allow for
 * this chat" means exactly the conversation the user was looking at when they
 * said it, and switching threads asks again.
 */
class ScreenshotConsent {
  private threadId = ''
  /** Threads where the user chose "allow for this chat". */
  private sessionGrant = new Set<string>()
  /**
   * Threads that denied during the current turn. Cleared at the top of each
   * turn: a "no" settles this request, but the user may well say yes to the
   * next thing they ask for. Without it a denied model that retries inside the
   * same turn would re-prompt the user it was just refused by.
   */
  private turnDeny = new Set<string>()
  /** Last decision, so the handler can fail closed without re-deriving it. */
  private allowed = false

  setThread(threadId: string): void {
    const next = threadId || ''
    if (next === this.threadId) return
    this.threadId = next
    this.sessionGrant.clear()
    this.turnDeny.clear()
    this.allowed = false
  }

  /** Called once per user turn — forgets denials, keeps "allow for this chat". */
  beginTurn(): void {
    this.turnDeny.clear()
  }

  /**
   * Resolves the persisted policy and the in-memory grants into what should
   * happen next.
   */
  decide(persisted: ScreenCapturePolicy): 'allow' | 'ask' | 'deny' {
    if (persisted === 'never') return 'deny'
    if (this.turnDeny.has(this.threadId)) return 'deny'
    if (persisted === 'always') return 'allow'
    if (this.sessionGrant.has(this.threadId)) return 'allow'
    return 'ask'
  }

  /**
   * Records what the user chose. `scope` is undefined when a run is cancelled
   * rather than answered — that must not be remembered as a decision, so
   * callers only invoke this when the user actually pressed something.
   */
  record(scope: ApprovalScope): void {
    switch (scope) {
    case 'session':
      this.sessionGrant.add(this.threadId)
      break
    case 'deny':
      this.turnDeny.add(this.threadId)
      break
    default:
      // 'once' grants nothing beyond the capture it was given for, and
      // 'always' is persisted in settings rather than held here.
      break
    }
    remixAILogger.log('[ScreenshotConsent] recorded', scope, 'thread=', this.threadId)
  }

  /** Marks the outcome of the gate so the handler can verify it was consulted. */
  setAllowed(allowed: boolean): void {
    this.allowed = allowed
  }

  /**
   * Fail-closed check for the tool handler. The gate is the real decision
   * point; this only catches a call path that skipped it, in which case
   * refusing is the safe answer.
   */
  isAllowed(): boolean {
    return this.allowed
  }

  /** Consumes a one-shot grant so the next capture asks again. */
  consume(): void {
    if (!this.sessionGrant.has(this.threadId)) this.allowed = false
  }
}

export const screenshotConsent = new ScreenshotConsent()
