
import React, { useState } from 'react'
import './App.css'
import { WorkSpacePlugin } from './Client'
import { Logger } from './logger'

export const client = new WorkSpacePlugin()

function App () {
  const [payload, setPayload] = useState<string>('')
  const [result, setResult] = useState<string>()

  const handleChange = ({ target }: any) => {
    setPayload(target.value)
  }

  const test = async () => {
    setResult('')
    const r = await client.soltest()
    setResult('test done')
  }

  return (
    <div className="App">
      <div>v5</div>
      <Logger></Logger>
      <button className='btn btn-primary btn-sm' onClick={async () => await client.zip()}>zip</button>
      <button className='btn btn-primary btn-sm' onClick={async () => await client.ipfspush()}>ipfs push</button>
      <button className='btn btn-primary btn-sm' onClick={async () => await client.ipfspull(payload)}>ipfs pull</button>
      <button className='btn btn-primary btn-sm' onClick={async () => await client.ipfsConfig()}>ipfs config</button>
      <button className='btn btn-primary btn-sm' onClick={async () => await client.getAccounts()}>get accounts</button>
      <button className='btn btn-primary btn-sm' onClick={async () => await client.setSettings()}>set settings to injected</button>
      <button className='btn btn-primary btn-sm' onClick={async () => await client.getSettings()}>get settings</button>
      <button className='btn btn-primary btn-sm' onClick={async () => await test()}>run sol test</button>
      <button className='btn btn-primary btn-sm' onClick={async () => await client.highlight(payload)}>highlight</button>
      <button className='btn btn-primary btn-sm' onClick={async () => await client.addAnnotation(payload)}>annotation</button>
      <button className='btn btn-primary btn-sm' onClick={async () => await client.clearAnnotations(payload)}>clear annotation</button>
      <button className='btn btn-primary btn-sm' onClick={async () => await client.open(payload)}>openfile</button>
      <button className='btn btn-primary btn-sm' onClick={async () => await client.readddir(payload)}>readdir</button>
      <button className='btn btn-primary btn-sm' onClick={async () => await client.write(payload)}>write</button>
      <button className='btn btn-primary btn-sm' onClick={async () => await client.switchfile(payload)}>switch to file</button>
      <button className='btn btn-primary btn-sm' onClick={async () => await client.getcurrentfile()}>getcurrentfile</button>
      <button className='btn btn-primary btn-sm' onClick={async () => await client.importcontent(payload)}>import content resolve</button>
      <button className='btn btn-primary btn-sm' onClick={async () => await client.fetch(payload)}>api test fetch</button>
      <button className='btn btn-primary btn-sm' onClick={async () => await client.axios(payload)}>api test axios</button>
      <button className='btn btn-primary btn-sm' onClick={async () => await client.activate()}>activate</button>
      <button className='btn btn-primary btn-sm' onClick={async () => await client.deactivate()}>deactivate</button>
      <button className='btn btn-primary btn-sm' onClick={async () => await client.getresult()}>get compilation result</button>
      <button className='btn btn-primary btn-sm' onClick={async () => await client.getcompilerconfig()}>get compiler config</button>
      <button className='btn btn-primary btn-sm' onClick={async () => await client.getWorkSpace()}>get workspace</button>
      <button className='btn btn-primary btn-sm' onClick={async () => await client.getWorkSpaces()}>get workspaces</button>
      <button className='btn btn-primary btn-sm' onClick={async () => await client.createWorkSpace(payload)}>create workspace</button>
      <button className='btn btn-primary btn-sm' onClick={async () => await client.gitinit(payload)}>git init</button>
      <button className='btn btn-primary btn-sm' onClick={async () => await client.gitstatus(payload)}>git status</button>
      <button className='btn btn-primary btn-sm' onClick={async () => await client.gitlog()}>git log</button>
      <button className='btn btn-primary btn-sm' onClick={async () => await client.gitcommit()}>git commit</button>
      <button className='btn btn-primary btn-sm' onClick={async () => await client.gitadd(payload)}>git add</button>
      <button className='btn btn-primary btn-sm' onClick={async () => await client.gitremove(payload)}>git rm</button>
      <button className='btn btn-primary btn-sm' onClick={async () => await client.gitlsfiles()}>git ls files</button>
      <button className='btn btn-primary btn-sm' onClick={async () => await client.gitreadblob(payload)}>git read blob</button>
      <button className='btn btn-primary btn-sm' onClick={async () => await client.gitresolveref()}>git resolve head</button>
      <button className='btn btn-primary btn-sm' onClick={async () => await client.gitbranches()}>git branches</button>
      <button className='btn btn-primary btn-sm' onClick={async () => await client.gitbranch(payload)}>git create branch</button>
      <button className='btn btn-primary btn-sm' onClick={async () => await client.gitcheckout(payload)}>git checkout</button>
      <button className='btn btn-primary btn-sm' onClick={async () => await client.gitcurrentbranch()}>git current branch</button>
      <button className='btn btn-primary btn-sm' onClick={async () => await client.changetoinjected()}>change to injected</button>
      <button className='btn btn-primary btn-sm' onClick={async () => await client.pinatapush()}>pinata write</button>
      <button className='btn btn-primary btn-sm' onClick={async () => await client.pinlist()}>pinata list</button>
      <button className='btn btn-primary btn-sm' onClick={async () => await client.setCallBacks()}>callbacks</button>
      <button className='btn btn-primary btn-sm' onClick={async () => await client.log('')}>log</button>
      <button className='btn btn-primary btn-sm' onClick={async () => await client.activatePlugin(payload)}>activate</button>
      <button className='btn btn-primary btn-sm' onClick={async () => await client.deActivatePlugin(payload)}>deactivate</button>
      <button className='btn btn-primary btn-sm' onClick={async () => await client.debug(payload)}>debug</button>
      <input
        type="text"
        id="payload"
        placeholder="Enter payload here..."
        value={payload}
        onChange={handleChange}
      />
    </div>
  )
}

export default App
