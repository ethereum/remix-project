import { Selector, RequestLogger, Role } from 'testcafe'
import { Profile, LocationProfile, ExternalProfile } from '@remixproject/plugin-utils'

fixture`Plugin API tests`
  .page(process.env.TEST_URL || 'http://127.0.0.1:8080')
  .beforeEach(async t => {

  }).afterEach(async t => {
    console.log(await t.getBrowserConsoleMessages())
  })
const openPlugin = async (t: TestController, plugin: string) => {
  await t.click(`#icon-panel div[plugin="${plugin}"]`)
}

interface dataIdSelectorInterface extends Selector {
  select(id: string): Promise<any>
}

const dataIdSelector = async (id: string) => { return Selector(`[data-id="${id}"]`) }

const installPlugin = async (t: TestController, profile: Profile & LocationProfile & ExternalProfile) => {
  await t.click('*[plugin="pluginManager"]')
    .click('*[data-id="pluginManagerComponentPluginSearchButton')
    // cy.get(`*[data-id="pluginManagerLocalPluginModalDialogModalDialogModalTitle-react`).should('be.visible')
    .typeText('*[data-id="localPluginName', profile.name)
    .typeText('*[data-id="localPluginDisplayName', profile.displayName)
    .typeText('*[data-id="localPluginUrl', profile.url)
    .typeText('*[data-id="localPluginCanActivate', profile.canActivate && profile.canActivate.join(','))
    .click('*[data-id="pluginManagerLocalPluginModalDialog-modal-footer-ok-react"').click('*[plugin="pluginManager"]')
}

const expectLogMessage = async (t: TestController, msg: any) => {
  if (typeof msg !== 'string') msg = JSON.stringify(msg)
  const message = await Selector('#log').textContent
  console.log(message)
  await t.expect(message.includes(msg)).ok()
}

const localPluginData = {
  name: 'localplugin',
  displayName: 'localplugin',
  location: 'sidePanel',
  url: 'http://localhost:2020',
  canActivate: [
    'dGitProvider,flattener,solidityUnitTesting'
  ]
}

test('install plugin', async t => {
  // exists doesn't wait with timeouts, this is a hack but it works, it will wait for buttons to appear
  // https://testcafe.io/documentation/402829/guides/basic-guides/select-page-elements#selector-timeout
  await Selector('Button', { timeout: 120000 }).innerText
  if (await Selector('Button').withText('Sure').exists) {
    await t.click(Selector('Button').withText('Sure'))
  }
  await t.click('.introjs-skipbutton')
  await installPlugin(t, localPluginData)
})

test.disablePageReloads('switch to plugin', async t => {
  await t
    .click('#verticalIconsKindpluginManager')
    // .click('[data-id="pluginManagerComponentActivateButtondgittest"]')
    .click('[data-id="verticalIconsKindlocalplugin"]')
    .switchToIframe('#plugin-localplugin')
})

test.disablePageReloads('not be able to get current file', async t => {
  await t
    .click(Selector('Button').withText('getcurrentfile'))
  await expectLogMessage(t, 'Error from IDE : Error: No such file or directory No file selected')
})

test.disablePageReloads('be able to get current file', async t => {
  await t
    .switchToMainWindow()

  await openPlugin(t, 'filePanel')
  await t.click(await dataIdSelector('treeViewLitreeViewItemREADME.txt'))
  await openPlugin(t, localPluginData.name)
  await t.switchToIframe('#plugin-localplugin')
    .click(Selector('Button')
      .withText('getcurrentfile'))

  await expectLogMessage(t, 'README.txt')
})

test.disablePageReloads('gets the current workspace', async t => {
  await t.click(Selector('Button')
    .withText('get workspace'))
  await expectLogMessage(t, { name: 'default_workspace', isLocalhost: false, absolutePath: '.workspaces/default_workspace' })
})

test.disablePageReloads('creates a workspace', async t => {
  await t.typeText('#payload', 'testing')
    .click(Selector('Button')
      .withText('create workspace')).wait(2000).click(Selector('Button')
      .withText('get workspace'))
  await expectLogMessage(t, { name: 'testing', isLocalhost: false, absolutePath: '.workspaces/testing' })
})

test.disablePageReloads('get file list', async t => {
  await t.typeText('#payload', '/', { replace: true })
    .click(Selector('Button')
      .withText('readdir'))
  await expectLogMessage(t, { contracts: { isDirectory: true }, scripts: { isDirectory: true }, tests: { isDirectory: true }, 'README.txt': { isDirectory: false } })
})

test.disablePageReloads('open a file', async t => {
  const file = 'contracts/2_Owner.sol'
  await t.typeText('#payload', file, { replace: true })
    .click(Selector('Button')
      .withText('openfile'))

  await expectLogMessage(t, { event: 'currentFileChanged', result: file })

  await t.click(Selector('Button')
    .withText('getcurrentfile'))

  await expectLogMessage(t, file)
})

test.disablePageReloads('run a test file', async t => {
  await t
    .click('#appendToLog')
    .click(Selector('Button')
      .withText('run sol test'))
    .switchToMainWindow()
    .click('#remember')
    .click(Selector('span').withText('Accept'))
    .switchToIframe('#plugin-localplugin')
    .click(Selector('Button')
      .withText('run sol test')).wait(5000)

  await expectLogMessage(t, '"totalPassing":1,"totalFailing":0')
})
