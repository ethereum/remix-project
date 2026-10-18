import { remixAILogger } from '../../helpers/logger'

/**
 * Stops the same interactive component being rendered into the chat over and
 * over.
 */
class GenerativeUiGuard {
  private rendered = new Set<string>()

  /**
   * Starts a new exchange.
   */
  beginTurn(prompt: string): void {
    if (typeof prompt === 'string' && /^\s*\[ui:/.test(prompt)) return
    this.rendered.clear()
  }

  /** True when this exact component has not been put on screen yet. */
  claim(fingerprint: string): boolean {
    if (this.rendered.has(fingerprint)) {
      remixAILogger.warn('[render_ui] suppressed a repeat render of a component already on screen')
      return false
    }
    this.rendered.add(fingerprint)
    return true
  }

  /** Test seam — production code drives this through `beginTurn`. */
  reset(): void {
    this.rendered.clear()
  }
}

export const generativeUiGuard = new GenerativeUiGuard()

/**
 * Order-stable digest of a component tree. Keys are sorted so that two trees
 * which differ only in property order — common when a model rebuilds the same
 * JSON from scratch — collapse to the same fingerprint.
 */
export function fingerprintUiTree(tree: unknown, title?: string): string {
  const stable = (value: any): any => {
    if (Array.isArray(value)) return value.map(stable)
    if (value && typeof value === 'object') {
      return Object.keys(value).sort().reduce((out: Record<string, any>, key) => {
        out[key] = stable(value[key])
        return out
      }, {})
    }
    return value
  }

  const text = JSON.stringify({ title: title || '', tree: stable(tree) })
  let hash = 0x811c9dc5
  for (let i = 0; i < text.length; i++) {
    hash ^= text.charCodeAt(i)
    hash = Math.imul(hash, 0x01000193)
  }
  return (hash >>> 0).toString(36) + ':' + text.length
}
