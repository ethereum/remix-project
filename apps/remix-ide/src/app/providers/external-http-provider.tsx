import * as packageJson from '../../../../../package.json'
import React from 'react' // eslint-disable-line
import { FormattedMessage } from 'react-intl'
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
  constructor(blockchain) {
    super(profile, blockchain, 'http://127.0.0.1:8545')
  }

  body(): JSX.Element {
    const thePath = '<path/to/local/folder/for/test/chain>'
    return (
      <>
        <div className="">
          <FormattedMessage
            id="udapp.externalHttpProviderText1"
            values={{
              a: (chunks) => (
                <a href="https://geth.ethereum.org/docs/rpc/server" target="_blank" rel="noreferrer">
                  <>{chunks}</>
                </a>
              )
            }}
          />
          <div className="border p-1">geth --http --http.corsdomain https://remix.ethereum.org</div>
          <br />
          <FormattedMessage
            id="udapp.externalHttpProviderText2"
            values={{
              a: (chunks) => (
                <a href="https://geth.ethereum.org/getting-started/dev-mode" target="_blank" rel="noreferrer">
                  <>{chunks}</>
                </a>
              )
            }}
          />
          <div className="border p-1">
            geth --http --http.corsdomain="{window.origin}" --http.api web3,eth,debug,personal,net --vmdebug --datadir {thePath} --dev console
          </div>
          <br />
          <br />
          <FormattedMessage id="udapp.externalHttpProviderText3" values={{ b: (chunks) => <b><>{chunks}</></b> }} />
          <br />
          <br />
          <FormattedMessage
            id="udapp.externalHttpProviderText4"
            values={{
              a: (chunks) => (
                <a href="https://remix-ide.readthedocs.io/en/latest/run.html#more-about-web3-provider" target="_blank" rel="noreferrer">
                  {chunks}
                </a>
              )
            }}
          />
          <br />
          <br />
          External HTTP Provider Endpoint
        </div>
      </>
    )
  }
}
