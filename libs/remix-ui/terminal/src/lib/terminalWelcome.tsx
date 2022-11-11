import React, { useEffect } from 'react' // eslint-disable-line
import { FormattedMessage } from 'react-intl'

const TerminalWelcomeMessage = ({ packageJson, storage }) => {
  return (
    <div className="remix_ui_terminal_block px-4 " data-id="block_null">
      <div className="remix_ui_terminal_welcome"> <FormattedMessage id='terminal.welcomeText1' defaultMessage='Welcome to' /> Remix {packageJson} </div><br />
      <div className=""><FormattedMessage id='terminal.welcomeText2' defaultMessage='Your files are stored in' /> {(window as any).remixFileSystem.name}, {storage} <FormattedMessage id='terminal.used' defaultMessage='used' /></div><br />
      <div><FormattedMessage id='terminal.welcomeText3' defaultMessage='You can use this terminal to' />: </div>
      <ul className='ml-0 mr-4'>
        <li key="details-and-debug" ><FormattedMessage id='terminal.welcomeText4' defaultMessage='Check transactions details and start debugging' />.</li>
        <li key="run-javascript"><FormattedMessage id='terminal.welcomeText5' defaultMessage='Execute JavaScript scripts' />:
          <br />
          <i> - <FormattedMessage id='terminal.welcomeText6' defaultMessage='Input a script directly in the command line interface' /> </i>
          <br />
          <i> - <FormattedMessage id='terminal.welcomeText7' defaultMessage='Select a Javascript file in the file explorer and then run \`remix.execute()\` or \`remix.exeCurrent()\`  in the command line interface' />  </i>
          <br />
          <i> - <FormattedMessage id='terminal.welcomeText8' defaultMessage='Right click on a JavaScript file in the file explorer and then click \`Run\`' /> </i>
        </li>
      </ul>

      <div><FormattedMessage id='terminal.welcomeText9' defaultMessage='The following libraries are accessible' />:</div>
      <ul className='ml-0 mr-4'>
        <li key="web3-152"><a target="_blank" href="https://web3js.readthedocs.io/en/1.0/">web3 version 1.5.2</a></li>
        <li key="ethers-console"><a target="_blank" href="https://docs.ethers.io">ethers.js</a> </li>
        <li key="remix-console">remix</li>
      </ul>
      <div><FormattedMessage id='terminal.welcomeText10' defaultMessage='Type the library name to see available commands' />.</div>
    </div>
  )
}

export default TerminalWelcomeMessage
