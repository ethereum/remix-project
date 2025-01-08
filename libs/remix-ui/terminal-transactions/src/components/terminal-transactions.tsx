import { TerminalContext } from '@remix-ui/terminal'
import { Plugin } from '@remixproject/engine'
import { PluginQueueItem } from '@remixproject/plugin-utils/src/lib/tools/queue';
import React, { useState, useEffect, useContext } from 'react' // eslint-disable-line

export interface TerminalTransactionsProps {
  plugin: Plugin
}

const pluginsToWatch = ['injected-metamask', 'web3Provider'];

interface queue {
  pluginName: string,
  queue: PluginQueueItem[]
}

export const TerminalTransactions = (props: TerminalTransactionsProps) => {
  
  const { xtermState, dispatchXterm } = useContext(TerminalContext)
  const [queues, setQueues] = useState<queue[]>([])

  useEffect(() => {
   
    pluginsToWatch.forEach(pluginName => {
      props.plugin.on(pluginName, 'queue', (data: any) => {
        //console.log('plugin', pluginName, 'queue', data);
        setQueues(queues => [...queues.filter(queue => queue.pluginName !== pluginName), { pluginName, queue: data }]);
      });
    });
    return () => {
      pluginsToWatch.forEach(pluginName => {
        props.plugin.off(pluginName, 'queue');
      });
    };
  }, [props.plugin]);

return (<>
  <div style={{ flexGrow: 1 }} className={`${xtermState.selectedTerminalTab === 'transactions' ? 'h-100 d-flex': 'h-0 d-none'}`}>
    {queues.map((queue, index) => {
      return <div className='flex-row remix_ui_terminal_block' key={index}>
        <div>{queue.queue.map((item, i) => <div className='flex-row w-100' key={i}>{item && (item as any).args && (item as any).args[0] && (item as any).args[0].method}</div>)}</div>
      </div>
    })}
  </div>
</>)

}