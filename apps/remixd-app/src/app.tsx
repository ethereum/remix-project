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
      <h1>Hello, Remix!</h1>
      <input type='text' value={url} onChange={e => setUrl(e.target.value)} placeholder='https://remix.ethereum.org' />
      <input type='button' value='start remixd' onClick={() => startRemixd()} />
      {messageList.map((message, index) => {
        return <p key={index}>{message}</p>
      })
      }
    </>
  );
}

