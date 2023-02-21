import * as packageJson from '../../../../../package.json'
import React from 'react' // eslint-disable-line
import { AbstractProvider } from './abstract-provider'

const profile = {
  name: 'basic-http-provider',
  displayName: 'External Http Provider',
  kind: 'provider',
  description: 'External Http Provider',
  methods: ['sendAsync', 'init'],
  version: packageJson.version
}

export class ExternalHttpProvider extends AbstractProvider {
  constructor (blockchain) {
    super(profile, blockchain, 'http://127.0.0.1:8545')
  }

  body (): JSX.Element {
    const thePath = '<path/to/local/folder/for/test/chain>'
    return (
      <>
        <div className="">
            Note: To use Geth & https://remix.ethereum.org, configure it to allow requests from Remix:(see <a href="https://geth.ethereum.org/docs/rpc/server" target="_blank" rel="noreferrer">Geth Docs on rpc server</a>)
          <div className="border p-1">geth --http --http.corsdomain https://remix.ethereum.org</div>
          <br />
          To run Remix & a local Geth test node, use this command: (see <a href="https://geth.ethereum.org/getting-started/dev-mode" target="_blank" rel="noreferrer">Geth Docs on Dev mode</a>)
          <div className="border p-1">geth --http --http.corsdomain="{window.origin}" --http.api web3,eth,debug,personal,net --vmdebug --datadir {thePath} --dev console</div>
          <br />
          <br />
          <b>WARNING:</b> It is not safe to use the --http.corsdomain flag with a wildcard: <b>--http.corsdomain *</b>
          <br />
          <br />For more info: <a href="https://remix-ide.readthedocs.io/en/latest/run.html#more-about-web3-provider" target="_blank" rel="noreferrer">Remix Docs on External HTTP Provider</a>
          <br />
          <br />
          External HTTP Provider Endpoint
        </div>
      </>
    )
  }
}