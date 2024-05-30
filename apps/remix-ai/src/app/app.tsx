import React, { useState, useEffect, useRef } from 'react'

import { remixAiClient } from './utils/remix-ai-client'

import Button from 'react-bootstrap/Button'
import Accordion from 'react-bootstrap/Accordion'
import { CustomTooltip } from '@remix-ui/helper'

interface AppState {
  status: 'idle' | 'inProgress'
  environment: 'remote' | 'local'
  localUrl: string
}

interface OutputMap {
  [fileName: string]: any
}

const App = () => {
  const [output, setOutput] = useState<any>(remixAiClient)
  const [state, setState] = useState<AppState>({
    status: 'idle',
    environment: 'remote',
    localUrl: 'http://localhost:8000/',
  })

  return (
    <main id="remix-ai-plugin">
      <section>
        <div className="px-3 pt-3 mb-3 w-100">
          <CustomTooltip placement="bottom" tooltipText="Perform AI job by clicking this button">
            <Button data-id="add-repository" className="w-100 btn btn-secondary" onClick={() => console.log('running AI task')}>
              Perform AI job
            </Button>
          </CustomTooltip>
        </div>
      </section>
    </main>
  )
}

export default App
