// eslint-disable-next-line no-use-before-define
import React from 'react'

interface web3ProviderDialogProps {
  setWeb3Endpoint: (value: string) => void,
  externalEndpoint: string
}
const thePath = '<path/to/local/folder/for/test/chain>'

export function Web3ProviderDialog (props: web3ProviderDialogProps) {
  const handleInputEndpoint = (e) => {
    props.setWeb3Endpoint(e.target.value)
  }

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
        <br />For more info: <a href="https://remix-ide.readthedocs.io/en/latest/run.html#more-about-web3-provider" target="_blank" rel="noreferrer">Remix Docs on Web3 Provider</a>
        <br />
        <br />
        Web3 Provider Endpoint
      </div>
      <input
        onInput={handleInputEndpoint}
        type='text'
        name='prompt_text'
        id='prompt_text'
        style={{ width: '100%' }}
        className="form-control"
        defaultValue={props.externalEndpoint}
        data-id="modalDialogCustomPromptText"
      />
    </>
  )
}
