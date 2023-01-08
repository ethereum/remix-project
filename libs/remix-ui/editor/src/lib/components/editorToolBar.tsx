import { ViewPlugin } from '@remixproject/engine-web'
import React, { useState, useRef, useEffect, useReducer } from 'react' // eslint-disable-line
import { Form } from 'react-bootstrap'

export interface IEditorToolBarProps {
  plugin: any,
  unifiedToggle(isSplit: boolean): void
  isSplit: boolean
  isDiff: boolean
}



export const EditorToolBar = (props: IEditorToolBarProps) => {
  const { plugin, unifiedToggle, isSplit, isDiff } = props

  const toggleSplit = (e: any) => {
    console.log('toggleSplit', e.target.id)
    unifiedToggle(e.target.id !== 'split')
  }

  useEffect(() => {
    console.log('isSideBySide', isSplit)
  }, [isSplit])

  return (
    <div className="remix_ui_terminal_menu d-flex w-100 align-items-center position-relative border-top border-dark bg-light pl-2">

      {isDiff ? <>
        <Form.Check
          inline
          label="unified"
          name="diffStyle"
          type='radio'
          id={`split`}
          onChange={toggleSplit}
          checked={!isSplit}
        />
        <img src='assets/img/unified.svg' height={20} alt='split' />
        <Form.Check
          inline
          label="split"
          name="diffStyle"
          type='radio'
          id={`unified`}
          className="pl-2"
          onChange={toggleSplit}
          checked={isSplit}
        />
        <img src='assets/img/split.svg' height={20} alt='split' />
      </> : null}

    </div>
  )
}

