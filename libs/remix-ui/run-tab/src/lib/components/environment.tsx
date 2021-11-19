// eslint-disable-next-line no-use-before-define
import React from 'react'
import { EnvironmentProps } from '../types'

export function EnvironmentUI (props: EnvironmentProps) {
  const handleInputEndpoint = (e: any) => {
    props.setWeb3Endpoint(e.target.value)
  }

  const handleChangeExEnv = (env: string) => {
    const provider = props.providers.providerList.find(exEnv => exEnv.value === env)
    const fork = provider.fork // can be undefined if connected to an external source (web3 provider / injected)
    let context = provider.value

    context = context.startsWith('vm') ? 'vm' : context // context has to be 'vm', 'web3' or 'injected'
    const displayContent = web3ProviderDialogBody()

    props.setExecutionContext({ context, fork }, displayContent)
  }

  const web3ProviderDialogBody = () => {
    const thePath = '<path/to/local/folder/for/test/chain>'

    return (
      <>
        <div className="">
            Note: To use Geth & https://remix.ethereum.org, configure it to allow requests from Remix:(see <a href="https://geth.ethereum.org/docs/rpc/server" target="_blank">Geth Docs on rpc server</a>)
          <div className="border p-1">geth --http --http.corsdomain https://remix.ethereum.org</div>
          <br />
          To run Remix & a local Geth test node, use this command: (see <a href="https://geth.ethereum.org/getting-started/dev-mode" target="_blank">Geth Docs on Dev mode</a>)
          <div className="border p-1">geth --http --http.corsdomain="${window.origin}" --http.api web3,eth,debug,personal,net --vmdebug --datadir ${thePath} --dev console</div>
          <br />
          <br />
          <b>WARNING:</b> It is not safe to use the --http.corsdomain flag with a wildcard: <b>--http.corsdomain *</b>
          <br />
          <br />For more info: <a href="https://remix-ide.readthedocs.io/en/latest/run.html#more-about-web3-provider" target="_blank">Remix Docs on Web3 Provider</a>
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

  return (
    <div className="udapp_crow">
      <label id="selectExEnv" className="udapp_settingsLabel">
        Environment
      </label>
      <div className="udapp_environment">
        <select id="selectExEnvOptions" data-id="settingsSelectEnvOptions" className="form-control udapp_select custom-select" value={props.selectedEnv} onChange={(e) => { handleChangeExEnv(e.target.value) }}>
          {
            props.providers.providerList.map((provider, index) =>
              <option id={provider.id} key={index} data-id={provider.dataId}
                title={provider.title}
                value={provider.value}> { provider.content }
              </option>
            )
          }
        </select>
        <a href="https://remix-ide.readthedocs.io/en/latest/run.html#run-setup" target="_blank"><i className="udapp_infoDeployAction ml-2 fas fa-info" title="check out docs to setup Environment"></i></a>
      </div>
    </div>
  )
}
