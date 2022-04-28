// eslint-disable-next-line no-use-before-define
import React from 'react'

interface ScenarioProps {
  message: string,
  setScenarioPath: (path: string) => void,
  defaultValue?: string
}

export function ScenarioPrompt (props: ScenarioProps) {
  const handleScenarioPath = (e) => {
    props.setScenarioPath(e.target.value)
  }

  return (
    <div> { props.message }
      <div>
        <input id="prompt_text" type="text" name='prompt_text' className="form-control" style={{ width: '100%' }} onInput={handleScenarioPath} data-id='modalDialogCustomPromptText' defaultValue={props.defaultValue} />
      </div>
    </div>
  )
}
