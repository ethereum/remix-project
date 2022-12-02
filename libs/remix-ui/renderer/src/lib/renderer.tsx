import React, { useEffect, useState } from 'react' //eslint-disable-line
import { helper } from '@remix-project/remix-solidity'
import './renderer.css'
interface RendererProps {
  message: any;
  opt?: any,
  plugin: any,
  errLine?: number,
  errColumn?: number,
  errFile?: string
}

const classType = {
  'error': 'alert alert-danger',
  'warning': 'alert alert-warning',
  'info': 'alert alert-info'
}

export const Renderer = ({ message, opt = {}, plugin, errColumn, errLine, errFile }: RendererProps) => {
  const [messageText, setMessageText] = useState(null)
  const [editorOptions, setEditorOptions] = useState({
    useSpan: false,
    type: '',
    errFile: ''
  })
  const [classList, setClassList] = useState('alert alert-warning')
  const [close, setClose] = useState(false)

  useEffect(() => {
    if (!message) return
    let text

    if (typeof message === 'string') {
      text = message
    } else if (message.innerText) {
      text = message.innerText
    }

    if (!text) return
    // ^ e.g:
    // browser/gm.sol: Warning: Source file does not specify required compiler version! Consider adding "pragma solidity ^0.6.12
    // https://github.com/OpenZeppelin/openzeppelin-contracts/blob/release-v3.2.0/contracts/introspection/IERC1820Registry.sol:3:1: ParserError: Source file requires different compiler version (current compiler is 0.7.4+commit.3f05b770.Emscripten.clang) - note that nightly builds are considered to be strictly less than the released version
    if (errColumn !== undefined && errLine !== undefined && errFile !== undefined) {
      opt.errLine = errLine
      opt.errCol = errColumn
      opt.errFile = errFile
    } else {
      const positionDetails = helper.getPositionDetails(text)
      opt.errLine = positionDetails.errLine
      opt.errCol = positionDetails.errCol
      opt.errFile = positionDetails.errFile ? (positionDetails.errFile as string).trim() : ''
    }

    setMessageText(text)
    setEditorOptions(opt)
    setClose(close !== undefined ? close : false)
    setClassList(classType[opt.type] ? classType[opt.type] : 'alert alert-warning')
  }, [message, opt])

  

  const handleErrorClick = (opt) => {
    if (opt.click) {
      opt.click(message)
    } else if (opt.errFile !== undefined && opt.errLine !== undefined && opt.errCol !== undefined) {
      _errorClick(opt.errFile, opt.errLine, opt.errCol)
    }
  }

  const handleClose = () => {
    setClose(true)
  }

  const _errorClick = async (errFile, errLine, errCol) => {
    if (errFile !== await plugin.call('config', 'getAppParameter', 'currentFile')) {
      // TODO: refactor with this._components.contextView.jumpTo
      if (await plugin.call('fileManager', 'exists', errFile)) {
        await plugin.call('fileManager', 'open', errFile)
        await plugin.call('editor', 'gotoLine', errLine, errCol)
      }
    } else {
      await plugin.call('editor', 'gotoLine', errLine, errCol)
    }
  }

  return (
    <>
      {
        messageText && !close && (
          <div className={`remixui_sol ${editorOptions.type} ${classList}`} data-id={editorOptions.errFile} onClick={() => handleErrorClick(editorOptions)}>
            { editorOptions.useSpan ? <span> { messageText } </span> : <pre><span>{ messageText }</span></pre> }
            { close && <div className="close" data-id="renderer" onClick={handleClose}>
              <i className="fas fa-times"></i>
            </div> }
          </div>)
      }
    </>
  )
}
