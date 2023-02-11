import { remixProfiles } from '@remixproject/plugin-api'
import { createConnectorClient } from '../src'

describe('Remix Api', () => {
  const client = createConnectorClient({
    send() {},
    on() {}
  })

  test('Solidity', () => {
    expect(client.solidity).toBeDefined()
    expect(client.solidity.getCompilationResult).toBeDefined()
    expect(client.solidity.on).toBeDefined()
  })
  test('File Manager', () => {
    expect(client.fileManager).toBeDefined()
    expect(client.fileManager.getCurrentFile).toBeDefined()
    expect(client.fileManager.getFile).toBeDefined()
    expect(client.fileManager.getFolder).toBeDefined()
    expect(client.fileManager.setFile).toBeDefined()
    expect(client.fileManager.switchFile).toBeDefined()
    expect(client.fileManager.on).toBeDefined()
  })
  test('Editor', () => {
    expect(client.editor.discardHighlight).toBeDefined()
    expect(client.editor.highlight).toBeDefined()
    expect(client.editor.on).toBeDefined()
  })
  test('Network', () => {
    expect(client.network.addNetwork).toBeDefined()
    expect(client.network.detectNetwork).toBeDefined()
    expect(client.network.getEndpoint).toBeDefined()
    expect(client.network.getNetworkProvider).toBeDefined()
    expect(client.network.removeNetwork).toBeDefined()
    expect(client.network.on).toBeDefined()
  })
  test('Udapp', () => {
    expect(client.udapp.createVMAccount).toBeDefined()
    expect(client.udapp.getAccounts).toBeDefined()
    expect(client.udapp.sendTransaction).toBeDefined()
    expect(client.udapp.on).toBeDefined()
  })

})
