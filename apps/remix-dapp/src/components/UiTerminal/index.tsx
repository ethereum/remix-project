import React, {
  useState,
  useEffect,
  useRef,
  type SyntheticEvent,
  useContext,
} from 'react';
import { FormattedMessage } from 'react-intl';
// import { CommentCount, DiscussionEmbed } from 'disqus-react';
import { CustomTooltip } from '@remix-ui/helper';
import TxList from './TxList';

import './index.css';
import { AppContext } from '../../contexts';

export interface ClipboardEvent<T = Element> extends SyntheticEvent<T, any> {
  clipboardData: DataTransfer;
}

export const RemixUiTerminal = (props: any) => {
  const { appState, dispatch } = useContext(AppContext);
  const { journalBlocks, height, hidden } = appState.terminal;

  const [display, setDisplay] = useState('transaction');

  const messagesEndRef = useRef<any>(null);
  const typeWriterIndexes = useRef<any>([]);

  // terminal dragable
  const panelRef = useRef(null);
  const terminalMenu = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [journalBlocks.length]);

  const handleClearConsole = () => {
    typeWriterIndexes.current = [];
    dispatch({ type: 'SET_TERMINAL', payload: { journalBlocks: [] } });
  };
  /* start of autoComplete */

  const handleToggleTerminal = () => {
    dispatch({
      type: 'SET_TERMINAL',
      payload: { hidden: !hidden, height: hidden ? 250 : 35 },
    });
  };

  return (
    <div className="fixed-bottom" style={{ height }}>
      <div
        id="terminal-view"
        className="h-100 d-flex"
        data-id="terminalContainer-view"
      >
        <div
          style={{ fontSize: 12 }}
          className="d-flex position-relative flex-column flex-grow-1"
          ref={panelRef}
        >
          <div className="z-2 d-flex">
            <div
              className="d-flex w-100 align-items-center position-relative border-top border-dark bg-light"
              ref={terminalMenu}
              style={{ height: 35 }}
              data-id="terminalToggleMenu"
            >
              <CustomTooltip
                placement="top"
                tooltipId="terminalToggle"
                tooltipClasses="text-nowrap"
                tooltipText={
                  !hidden ? (
                    <FormattedMessage id="terminal.hideTerminal" />
                  ) : (
                    <FormattedMessage id="terminal.showTerminal" />
                  )
                }
              >
                <i
                  className={`mx-2 remix_ui_terminal_toggleTerminal fas ${
                    !hidden ? 'fa-angle-double-down' : 'fa-angle-double-up'
                  }`}
                  data-id="terminalToggleIcon"
                  onClick={handleToggleTerminal}
                ></i>
              </CustomTooltip>
              <div
                className="mx-2 remix_ui_terminal_toggleTerminal"
                role="button"
                id="clearConsole"
                data-id="terminalClearConsole"
                onClick={handleClearConsole}
              >
                <CustomTooltip
                  placement="top"
                  tooltipId="terminalClear"
                  tooltipClasses="text-nowrap"
                  tooltipText={<FormattedMessage id="terminal.clearConsole" />}
                >
                  <i className="fas fa-ban" aria-hidden="true"></i>
                </CustomTooltip>
              </div>
              {/* <div
                className="pl-2 remix_ui_terminal_toggleTerminal"
                onClick={() => {
                  setDisplay('transaction');
                }}
              >
                {
                  journalBlocks.filter(
                    (item: any) => item.name === 'knownTransaction'
                  ).length
                }{' '}
                Transactions
              </div>
              {shortname && (
                <div
                  className="pl-3 remix_ui_terminal_toggleTerminal"
                  onClick={() => {
                    setDisplay('comment');
                  }}
                >
                  <CommentCount
                    shortname={shortname}
                    config={{
                      url: window.origin,
                      identifier: `${address}|${document.domain}`,
                      title: name,
                    }}
                  >
                    Comments
                  </CommentCount>
                </div>
              )} */}
            </div>
          </div>
          <div
            tabIndex={-1}
            className="remix_ui_terminal_container d-flex h-100 m-0 flex-column"
            data-id="terminalContainer"
          >
            <div
              className={`position-relative flex-column-reverse h-100 ${
                display === 'transaction' ? 'd-flex' : 'd-none'
              }`}
            >
              <TxList />
            </div>
            {/* {shortname && (
              <div className={`p-3 ${display === 'comment' ? '' : 'd-none'}`}>
                <DiscussionEmbed
                  shortname={shortname}
                  config={{
                    url: window.origin,
                    identifier: `${address}|${document.domain}`,
                    title: name,
                  }}
                />
              </div>
            )} */}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RemixUiTerminal;
