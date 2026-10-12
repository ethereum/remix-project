import { test, expect, Page } from '@playwright/test'

// The "Meet AI mode" callout under the topbar AI/Code switcher. It appears
// when the user reaches for the docked RemixAI chat (once per session), and is
// retired for good once closed or once the user enters AI mode. Ignored, it
// comes back in later sessions up to 3 times. Until AI mode has been tried,
// the switcher's AI button plays an idle attention animation as a fallback.

test.use({ viewport: { width: 1600, height: 1000 } })
test.describe.configure({ mode: 'default', timeout: 180_000 })

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    // CI injects `window.__IS_E2E_TEST__ = true` into index.html
    // (scripts/inject-e2e-config.js), which switches the nudge plugin off.
    // These tests exercise nudges, so pin the flag to false and ignore the write.
    Object.defineProperty(window, '__IS_E2E_TEST__', { get: () => false, set: () => {}, configurable: false })
    // The flag also gates the beta corner widget; keep it out of the way
    localStorage.setItem('remix_beta_corner_dismissed', 'true')
  })
})

const sel = {
  callout: '[data-id="nudge-callout"]',
  switcher: '[data-id="aiModeSwitcher"]',
  // Any press inside the docked chat counts (the input is disabled while signed out)
  dockedPrompt: '#right-side-panel [data-id="remix-ai-prompt-area"]',
  host: '#ai-chat-maximized-host',
  chatReady: '[data-id="remix-ai-assistant-ready"]',
  attention: '[data-id="aiReviewModeBtn"][data-nudge-attention]'
}

async function removeOtherNudges (page: Page) {
  await page.evaluate(() => {
    document.querySelectorAll('.nudge-widget, .nudge-modal-backdrop, .nudge-decoration, .modal-backdrop').forEach((el) => el.remove())
  })
}

async function loadIde (page: Page, { reload = false } = {}) {
  // goto() to the same URL only changes the hash (no reload), so a real reload
  // is needed to check what persists across visits.
  if (reload) await page.reload()
  else await page.goto('http://127.0.0.1:8080/#lang=en')
  await expect(page.locator('[data-id="apploaded"]')).toBeAttached({ timeout: 90_000 })
  await expect(page.locator(`#right-side-panel ${sel.chatReady}`)).toBeAttached({ timeout: 90_000 })
  await removeOtherNudges(page)
}

async function reachForChat (page: Page) {
  await page.locator(sel.dockedPrompt).click({ position: { x: 20, y: 10 }, force: true })
}

test('first press in the docked chat shows the callout under the switcher; "Try AI mode" enters AI mode', async ({ page }) => {
  await loadIde(page)
  await expect(page.locator(sel.callout)).toHaveCount(0)

  await reachForChat(page)
  const callout = page.locator(sel.callout)
  await expect(callout).toBeVisible({ timeout: 15_000 })
  await expect(callout).toContainText('Meet AI mode')

  // Anchored below the switcher, arrow pointing at its center
  const sw = await page.locator(sel.switcher).boundingBox()
  const box = await callout.boundingBox()
  expect(box.y).toBeGreaterThan(sw.y + sw.height)
  expect(box.y - (sw.y + sw.height)).toBeLessThan(20)
  expect(box.x).toBeLessThan(sw.x + sw.width / 2)
  expect(box.x + box.width).toBeGreaterThan(sw.x + sw.width / 2)

  await page.locator('[data-id="nudge-callout-primary"]').click()
  await expect(callout).toHaveCount(0)
  await expect(page.locator(`${sel.host} ${sel.chatReady}`)).toBeAttached()
  await page.locator('[data-id="codeModeBtn"]').click({ force: true })
  await expect(page.locator(`#right-side-panel ${sel.chatReady}`)).toBeAttached()

  // Once ever: not shown again after a reload
  await loadIde(page, { reload: true })
  await reachForChat(page)
  await page.waitForTimeout(4000)
  await expect(page.locator(sel.callout)).toHaveCount(0)
})

test('"Got it" closes the callout for good', async ({ page }) => {
  await loadIde(page)
  await reachForChat(page)
  await expect(page.locator(sel.callout)).toBeVisible({ timeout: 15_000 })
  await page.locator('[data-id="nudge-callout-secondary"]').click()
  await expect(page.locator(sel.callout)).toHaveCount(0)
  // Closing the callout doesn't stop the AI button's animation
  await expect(page.locator(sel.attention)).toBeAttached()

  await loadIde(page, { reload: true })
  await reachForChat(page)
  await page.waitForTimeout(4000)
  await expect(page.locator(sel.callout)).toHaveCount(0)
  await expect(page.locator(sel.attention)).toBeAttached({ timeout: 15_000 })
})

test('an ignored callout comes back next session, up to 3 times; then only the AI button animation remains', async ({ page }) => {
  await loadIde(page)
  // The AI button animates before the callout ever shows
  await expect(page.locator(sel.attention)).toBeAttached({ timeout: 15_000 })

  for (let view = 1; view <= 3; view++) {
    if (view > 1) await loadIde(page, { reload: true })
    await reachForChat(page)
    await expect(page.locator(sel.callout)).toBeVisible({ timeout: 15_000 })
  }

  await loadIde(page, { reload: true })
  await reachForChat(page)
  await page.waitForTimeout(4000)
  await expect(page.locator(sel.callout)).toHaveCount(0)
  await expect(page.locator(sel.attention)).toBeAttached({ timeout: 15_000 })
})

test('entering AI mode stops the AI button animation for good', async ({ page }) => {
  await loadIde(page)
  await expect(page.locator(sel.attention)).toBeAttached({ timeout: 15_000 })
  await page.locator('[data-id="aiReviewModeBtn"]').click({ force: true })
  await expect(page.locator(`${sel.host} ${sel.chatReady}`)).toBeAttached()
  await expect(page.locator(sel.attention)).toHaveCount(0)
  await page.locator('[data-id="codeModeBtn"]').click({ force: true })

  await loadIde(page, { reload: true })
  await page.waitForTimeout(5000)
  await expect(page.locator(sel.attention)).toHaveCount(0)
})

test('entering AI mode before the callout ever shows retires it', async ({ page }) => {
  await loadIde(page)
  await page.locator('[data-id="aiReviewModeBtn"]').click({ force: true })
  await expect(page.locator(`${sel.host} ${sel.chatReady}`)).toBeAttached()
  await page.locator('[data-id="codeModeBtn"]').click({ force: true })
  await expect(page.locator(`#right-side-panel ${sel.chatReady}`)).toBeAttached()

  await reachForChat(page)
  await page.waitForTimeout(4000)
  await expect(page.locator(sel.callout)).toHaveCount(0)
})
