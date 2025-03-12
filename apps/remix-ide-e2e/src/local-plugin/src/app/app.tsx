import React, {useEffect, useState} from 'react'
import {RemixPlugin} from './Client'
import {Logger} from './logger'
import {filePanelProfile} from '@remixproject/plugin-api'
import {fileSystemProfile} from '@remixproject/plugin-api'
import {editorProfile} from '@remixproject/plugin-api'
import {settingsProfile} from '@remixproject/plugin-api'
import {networkProfile} from '@remixproject/plugin-api'
import {udappProfile} from '@remixproject/plugin-api'
import {compilerProfile} from '@remixproject/plugin-api'
import {contentImportProfile} from '@remixproject/plugin-api'
import {windowProfile} from '@remixproject/plugin-api'
import {pluginManagerProfile} from '@remixproject/plugin-api'
import {LibraryProfile, Profile} from '@remixproject/plugin-utils'


export const dGitProfile: LibraryProfile<any> = {
  name: 'dgitApi',
  methods: ['status', 'log', 'commit', 'add', 'branches'],
}
import './app.css'

const client = new RemixPlugin()

function App() {
  const [payload, setPayload] = useState<string>('')
  const [log, setLog] = useState<any>()
  const [started, setStarted] = useState<boolean>(false)
  const [events, setEvents] = useState<any>()
  const [profiles, setProfiles] = useState<Profile[]>([
    pluginManagerProfile,
    filePanelProfile,
    fileSystemProfile,
    dGitProfile,
    networkProfile,
    settingsProfile,
    editorProfile,
    compilerProfile,
    udappProfile,
    contentImportProfile,
    windowProfile
  ])

  const handleChange = ({target}: any) => {
    setPayload(target.value)
  }

  useEffect(() => {
    client.onload(async () => {
      const customProfiles = ['menuicons', 'tabs', 'solidityUnitTesting', 'hardhat-provider', 'notification']

      client.testCommand = async (data: any) => {
        methodLog(data)
      }

      let addProfiles = []
      for (const name of customProfiles) {
        const p = await client.call('manager', 'getProfile', name)
        addProfiles = [...addProfiles, p]
      }
      setProfiles((profiles) => [...profiles, ...addProfiles])

      profiles.map((profile: Profile) => {
        if (profile.events) {
          profile.events.map((event: string) => {
            client.on(profile.name as any, event, (...args: any) => {
              console.log('event :', event, args)
              eventLog({
                event: event,
                args: args
              })
            })
          })
        }
      })
    })
  }, [])

  const methodLog = (log: any) => {
    const addValue = typeof log === 'string' ? log : JSON.stringify(log)
    setLog((value) => `${value} ${addValue}`)
  }

  const eventLog = (log: any) => {
    const addValue = typeof log === 'string' ? log : JSON.stringify(log)
    setEvents((value) => `${value} ${addValue}`)
  }

  const clientMethod = async (profile: Profile, method: string) => {
    try {
      let ob: any = null
      try {
        ob = JSON.parse(payload)
        if (ob && !Array.isArray(ob)) {
          ob = [ob]
        }
      } catch (e) {}
      const args = ob || [payload]
      setStarted(true)
      setLog('')
      setEvents('')
      console.log('calling :', profile.name, method, ...args)
      await client.call('manager', 'activatePlugin', profile.name)
      const result = await client.call(profile.name as any, method, ...args)
      console.log('result :', result)
      methodLog(result)
    } catch (e) {
      methodLog(e.message)
    }
    setStarted(false)
  }

  return (
    <div className="App container-fluid">
      <h5>PLUGIN API TESTER</h5>
      <label id="callStatus">{started ? <>start</> : <>stop</>}</label>
      <br></br>
      <label>method results</label>
      <Logger id="methods" log={log}></Logger>
      <label>events</label>
      <Logger id="events" log={events}></Logger>
      <input className="form-control w-100" type="text" id="payload" placeholder="Enter payload here..." value={payload} onChange={handleChange} data-id="payload-input" />
      {profiles.map((profile: Profile) => {
        const methods = profile.methods.map((method: string) => {
          return (
            <button data-id={`${profile.name}:${method}`} key={method} className="btn btn-primary btn-sm ml-1 mb-1" onClick={async () => await clientMethod(profile, method)}>
              {method}
            </button>
          )
        })
        const events = profile.events
          ? profile.events.map((event: string) => {
            return (
              <label key={event} className="m-1">
                {event}
              </label>
            )
          })
          : null
        return (
          <div key={profile.name} className="small border-bottom">
            <label className="text-uppercase">{profile.name}</label>
            <br></br>
            {methods}
            <br></br>
            {events ? <label>EVENTS:</label> : null}
            {events}
          </div>
        )
      })}
    </div>
  )
}

export default App
