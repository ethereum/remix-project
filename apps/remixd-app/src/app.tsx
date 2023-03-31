import { contextBridge, ipcMain, ipcRenderer } from 'electron';
import { useEffect, useState } from 'react';

export default function App() {
  const [url, setUrl] = useState('https://remix.ethereum.org');
  const [messageList, setMessageList] = useState<string[]>([]);
  const startRemixd = () => {
    console.log('start remixd', url);
    window.electronAPI.startRemixd(url);
  };

  useEffect(() => {
    // get post message from electron

    window.addEventListener('message', (event) => {
      console.log('message', event.data);
      if (typeof event.data === 'string')
        setMessageList(messageList => [...messageList, event.data.toString()]);
    })

  }, []);


  return (
    <>
      <div className='container-fluid'>
        <h1>RemixD</h1>
        <p>Enter the URL of the Remix IDE you want to connect to.</p>
        <input className='w-100' type='text' value={url} onChange={e => setUrl(e.target.value)} placeholder='https://remix.ethereum.org' />
        <hr></hr>
        <input className='btn btn-primary w-100' type='button' value='start remixd' onClick={() => startRemixd()} />
        <ul>
          {messageList.map((message, index) => {
            return <li key={index}>{message}</li>
          })
          }
        </ul>
      </div>
    </>
  );
}

