
import React, { useEffect, useRef, useState } from 'react'
import { WorkSpacePlugin } from './Client'
import { Logger } from './logger'
import { useBehaviorSubject } from './usesubscribe/index'
import { filePanelProfile } from '@remixproject/plugin-api/lib/file-system/file-panel/profile'
import { filSystemProfile } from '@remixproject/plugin-api/lib/file-system/file-manager/profile'
import { dGitProfile } from '@remixproject/plugin-api/lib/dgit/profile'
import { editorProfile } from '@remixproject/plugin-api/lib/editor/profile'
import { settingsProfile } from '@remixproject/plugin-api/lib/settings/profile'
import { networkProfile } from '@remixproject/plugin-api/lib/network/profile'
import { terminalProfile } from '@remixproject/plugin-api/lib/terminal/profile'
import { udappProfile } from '@remixproject/plugin-api/lib/udapp'
import { compilerProfile } from '@remixproject/plugin-api/lib/compiler'
import { contentImportProfile } from '@remixproject/plugin-api/lib/content-import'
import { unitTestProfile } from '@remixproject/plugin-api/lib/unit-testing'
import { windowProfile } from '@remixproject/plugin-api/lib/window'
import { pluginManagerProfile } from '@remixproject/plugin-api/lib/plugin-manager'
import { IFileSystem } from '@remixproject/plugin-api'

import { Profile } from '@remixproject/plugin-utils'

export const client = new WorkSpacePlugin()

function App () {
  const [payload, setPayload] = useState<string>('')
  const [append, setAppend] = useState<boolean>(false)
  const [log, setLog] = useState<any>()
  const [profiles, setProfiles] = useState<any[]>([pluginManagerProfile, filePanelProfile, filSystemProfile, dGitProfile, networkProfile, settingsProfile, editorProfile, terminalProfile, compilerProfile, udappProfile, contentImportProfile, unitTestProfile, windowProfile])

  const handleChange = ({ target }: any) => {
    setPayload(target.value)
  }

  useEffect(() => {
    client.onload(async () => {
      const customProfiles = ['solidity']

      for (const name of customProfiles) {
        const p = await client.call('manager', 'getProfile', name)
        setProfiles(profiles => [p, ...profiles])
      }

      profiles.map((profile: Profile) => {
        if (profile.events) {
          profile.events.map((event: string) => {
            console.log(profile.name, event)
            client.on(profile.name as any, event, (...args:any) => {
              console.log(event, args)
            })
          })
        }
      })
    })
  }, [])

  const setAppendChange = ({ target }: any) => {
    console.log('append', target.checked)
    setAppend(target.checked)
  }

  const clientMethod = async (profile: Profile, method: string) => {
    try {
      let ob: any = null
      try {
        ob = JSON.parse(payload)
      } catch (e) {}
      const send = ob || [payload]
      const result = await client.call(profile.name as any, method, ...send)
      setLog(result)
    } catch (e) {
      setLog(e.message)
    }
  }

  return (
    <div className="App container-fluid">
      <h5>PLUGIN API TESTER</h5>
      <Logger log={log} append={append}></Logger>
      <input
        className='form-control w-100'
        type="text"
        id="payload"
        placeholder="Enter payload here..."
        value={payload}
        onChange={handleChange}
      />

      <input className='' id='appendToLog' type='checkbox' onChange={setAppendChange} /><label> Append logs</label>
      {profiles.map((profile: Profile) => {
        const methods = profile.methods.map((method: string) => {
          return <button data-id={`${profile.name}:${method}`} key={method} className='btn btn-primary btn-sm ml-1 mb-1' onClick={async () => await clientMethod(profile, method)}>{method}</button>
        })
        return <div key={profile.name} className='small'><label>{profile.name}</label><br></br>{methods}</div>
      })}

    </div>
  )
}

export default App
