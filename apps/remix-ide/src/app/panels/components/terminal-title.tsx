import React, {useState, useEffect, forwardRef} from 'react' // eslint-disable-line
import { CustomTooltip } from '@remix-ui/helper'
import { ButtonGroup, Dropdown} from 'react-bootstrap'
import { FormattedMessage, useIntl } from 'react-intl'
//import { ruiTerminalAPIType } from '../../../../../../libs/remix-ui/terminal/src/lib/types/terminalTypes.ts'
import { xTerminalAPIType } from '@remix-ui/xterm'


export interface TerminalTitleProps {
  ruiAPI:  any //ruiTerminalAPIType
  xAPI: xTerminalAPIType
  onReady: boolean,
  plugin: any
  shells
}

const TerminalTitle = (props: TerminalTitleProps) => {
  const [switchToRemixTerminal, setSwitchToRemixTerminal] = useState<boolean>(true)
  const [isOpen, setIsOpen] = useState<boolean>(true)
  
  //const xtermRef = React.useRef(null)
  const intl = useIntl()

  return (
    <div id="remic-ui-terminal-header" className='d-flex flex-row justify-content-between'>
      <div id="remix-ui-terminal-title-left" className='d-flex flex-row p-1'>
        <button
          className={`btn btn-sm btn-secondary mr-2 ${!props.onReady ? ' disable ' : null} ${!switchToRemixTerminal ? '' : 'border border-top'}`}
          onClick={() => { setSwitchToRemixTerminal(true) }}
        >
          Output
        </button>
        <button
          className={`btn btn-sm btn-secondary ${switchToRemixTerminal ? '' : 'border border-top'}`}
          onClick={() => { setSwitchToRemixTerminal(false) }}
        >
          <span className="far fa-terminal border-0 ml-1"></span>
        </button>
      </div>
      <div id="remix-ui-terminal-title-right">
        {!switchToRemixTerminal ?
          <div className={`xterm-panel-header-right`}>
            <Dropdown as={ButtonGroup}>
              <button className="btn btn-sm btn-secondary mr-2" onClick={async () => props.xAPI.clearTerminal()}>
                <CustomTooltip tooltipText={<FormattedMessage id='xterm.clear' defaultMessage='Clear terminal' />}>
                  <span className="far fa-ban border-0 p-0 m-0"></span>
                </CustomTooltip>
              </button>
              <button className="btn btn-sm btn-secondary" onClick={async () => props.xAPI.createTerminal()}>
                <CustomTooltip tooltipText={<FormattedMessage id='xterm.new' defaultMessage='New terminal' />}>
                  <span className="far fa-plus border-0 p-0 m-0"></span>
                </CustomTooltip>
              </button>
              <Dropdown.Toggle split variant="secondary" id="dropdown-split-basic" />
              <Dropdown.Menu className='custom-dropdown-items remixui_menuwidth'>
                { //props.xAPI.shells && /*props.xAPI.shells()*/["shell1", "shell2", "shell3"].map((shell, index) => {
                  //return (<Dropdown.Item key={index} onClick={async () => await props.xAPI.createTerminal(shell)}>{shell}</Dropdown.Item>)
                //}) 
                  <Dropdown.Item key={8888} onClick={async () => {}}>{"shell"}</Dropdown.Item>
                }
              </Dropdown.Menu>
            </Dropdown>
            <button className="btn ml-2 btn-sm btn-secondary" onClick={props.xAPI.closeTerminal}>
              <CustomTooltip tooltipText={<FormattedMessage id='xterm.close' defaultMessage='Close terminal' />}>
                <span className="far fa-trash border-0 ml-1"></span>
              </CustomTooltip>
            </button>
          </div> :
          <div className={`terminal-panel-header-right`}>
            <div className="remix_ui_terminal_bar d-flex">
              <div className="remix_ui_terminal_menu d-flex w-100 align-items-center position-relative border-top border-dark bg-light" data-id="terminalToggleMenu">
                <CustomTooltip
                  placement="top"
                  tooltipId="terminalToggle"
                  tooltipClasses="text-nowrap"
                  tooltipText={isOpen ? <FormattedMessage id="terminal.hideTerminal" /> : <FormattedMessage id="terminal.showTerminal" />}
                >
                  <i
                    className={`mx-2 remix_ui_terminal_toggleTerminal fas ${isOpen ? 'fa-angle-double-down' : 'fa-angle-double-up'}`}
                    data-id="terminalToggleIcon"
                    onClick={() => {
                      setIsOpen(!isOpen)
                      props.plugin.call('layout', 'minimize', props.plugin.profile.name, isOpen)
                    }}
                  ></i>
                </CustomTooltip>
                <div className="mx-2 remix_ui_terminal_console" id="clearConsole" data-id="terminalClearConsole" onClick={props.ruiAPI.handleClearConsole}>
                  <CustomTooltip placement="top" tooltipId="terminalClear" tooltipClasses="text-nowrap" tooltipText={<FormattedMessage id="terminal.clearConsole" />}>
                    <i className="fas fa-ban" aria-hidden="true"></i>
                  </CustomTooltip>
                </div>
                <CustomTooltip placement="top" tooltipId="terminalClear" tooltipClasses="text-nowrap" tooltipText={<FormattedMessage id="terminal.pendingTransactions" />}>
                  <div className="mx-2">0</div>
                </CustomTooltip>
                <CustomTooltip
                  placement="top"
                  tooltipId="terminalClear"
                  tooltipClasses="text-nowrap"
                  tooltipText={intl.formatMessage({ id: props.ruiAPI.isVM ? 'terminal.listenVM' : 'terminal.listenTitle'})}
                >
                  <div className="h-80 mx-3 align-items-center remix_ui_terminal_listenOnNetwork custom-control custom-checkbox">
                    <CustomTooltip placement="top" tooltipId="terminalClear" tooltipClasses="text-nowrap" tooltipText={intl.formatMessage({ id: 'terminal.listenTitle' })}>
                      <input
                        className="custom-control-input"
                        id="listenNetworkCheck"
                        onChange={props.ruiAPI.listenOnNetwork}
                        type="checkbox"
                        disabled={props.ruiAPI.isVM}
                      />
                    </CustomTooltip>
                    <label
                      className="form-check-label custom-control-label text-nowrap"
                      style={{ paddingTop: '0.125rem' }}
                      htmlFor="listenNetworkCheck"
                      data-id="listenNetworkCheckInput"
                    >
                      <FormattedMessage id="terminal.listen" />
                    </label>
                  </div>
                </CustomTooltip>
                <div className="remix_ui_terminal_search d-flex align-items-center h-100">
                  <i className="remix_ui_terminal_searchIcon d-flex align-items-center justify-content-center fas fa-search bg-light" aria-hidden="true"></i>
                  <input
                    onChange={(event) => props.ruiAPI.setSearchInput(event.target.value.trim())}
                    type="text"
                    className="remix_ui_terminal_filter border form-control"
                    id="searchInput"
                    placeholder={intl.formatMessage({ id: 'terminal.search' })}
                    data-id="terminalInputSearch"
                  />
                </div>
              </div>
            </div>
          </div>
        }
      </div>
    </div>
  )
}

export default TerminalTitle
