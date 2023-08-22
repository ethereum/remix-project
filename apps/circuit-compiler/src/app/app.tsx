import React, { useEffect } from 'react'

import { CircomPluginClient } from './services/circomPluginClient'

function App() {

  useEffect(() => {
    new CircomPluginClient()
  }, [])
  
  return (
    <div className="App">
    </div>
  )
}

export default App