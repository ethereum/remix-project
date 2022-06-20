import React, { useEffect, useState } from 'react' // eslint-disable-line
import { CompileErrors, ContractsFile, SolidityCompilerProps } from './types'
import { CompilerContainer } from './compiler-container' // eslint-disable-line
import { ContractSelection } from './contract-selection' // eslint-disable-line
import { Toaster } from '@remix-ui/toaster' // eslint-disable-line
import { ModalDialog } from '@remix-ui/modal-dialog' // eslint-disable-line
import { Renderer } from '@remix-ui/renderer' // eslint-disable-line

import './css/style.css'

export const SolidityCompiler = (props: SolidityCompilerProps) => {
  const { api, api: { currentFile, compileTabLogic, configurationSettings } } = props
  const [state, setState] = useState({
    isHardhatProject: false,
    isTruffleProject: false,
    workspaceName: '',
    currentFile,
    configFilePath: 'compiler_config.json',
    loading: false,
    compileTabLogic: null,
    compiler: null,
    toasterMsg: '',
    modal: {
      hide: true,
      title: '',
      message: null,
      okLabel: '',
      okFn: () => {},
      cancelLabel: '',
      cancelFn: () => {},
      handleHide: null
    }
  })
  const [currentVersion, setCurrentVersion] = useState('')
  const [hideWarnings, setHideWarnings] = useState<boolean>(false)
  const [compileErrors, setCompileErrors] = useState<Record<string, CompileErrors>>({ [currentFile]: api.compileErrors })
  const [badgeStatus, setBadgeStatus] = useState<Record<string, { key: string, title?: string, type?: string }>>({})
  const [contractsFile, setContractsFile] = useState<ContractsFile>({})

  useEffect(() => {
    (async () => {
      const hide = await api.getAppParameter('hideWarnings') as boolean || false
      setHideWarnings(hide)
    })()
  }, [])

  useEffect(() => {
    if (badgeStatus[currentFile]) {
      api.emit('statusChanged', badgeStatus[currentFile])
    } else {
      api.emit('statusChanged', { key: 'none' })
    }
  }, [badgeStatus[currentFile], currentFile])

  // Return the file name of a path: ex "browser/ballot.sol" -> "ballot.sol"
  const getFileName = (path) => {
    const part = path.split('/')

    return part[part.length - 1]
  }

  api.onCurrentFileChanged = (currentFile: string) => {
    setState(prevState => {
      return { ...prevState, currentFile }
    })
  }

  api.onSetWorkspace = async (isLocalhost: boolean, workspaceName: string) => {
    const isHardhat = isLocalhost && await compileTabLogic.isHardhatProject()
    const isTruffle =  await compileTabLogic.isTruffleProject()
    setState(prevState => {
      return { ...prevState, currentFile, isHardhatProject: isHardhat, workspaceName: workspaceName, isTruffleProject:  isTruffle }
    })
  }
  
  api.onFileRemoved = (path: string) => {
    if (path === state.configFilePath)
      setState(prevState => {
        return { ...prevState, configFilePath: '' }
      })
  }

  api.onNoFileSelected = () => {
    setState(prevState => {
      return { ...prevState, currentFile: '' }
    })
    setCompileErrors({} as Record<string, CompileErrors>)
  }

  api.onCompilationFinished = (compilationDetails: { contractMap: { file: string } | Record<string, any>, contractsDetails: Record<string, any>, target?: string }) => {
    const { contractMap, contractsDetails, target } = compilationDetails
    const contractList = contractMap ? Object.keys(contractMap).map((key) => {
      return {
        name: key,
        file: getFileName(contractMap[key].file)
        }
    }) : []

    setContractsFile({ ...contractsFile, [target]: { contractList, contractsDetails } })
    setCompileErrors({ ...compileErrors, [currentFile]: api.compileErrors })
  }

  api.onFileClosed = (name) => {
    if (name === currentFile) {
      setCompileErrors({ ...compileErrors, [currentFile]: {} as CompileErrors })
      setBadgeStatus({ ...badgeStatus, [currentFile]: { key: 'none' } })
    }
  }

  api.statusChanged = (data: { key: string, title?: string, type?: string }) => {
    setBadgeStatus({ ...badgeStatus, [currentFile]: data })
  }

  const setConfigFilePath = (path: string) => {
    setState(prevState => {
      return { ...prevState, configFilePath: path }
    })
  }


  const toast = (message: string) => {
    setState(prevState => {
      return { ...prevState, toasterMsg: message }
    })
  }

  const updateCurrentVersion = (value) => {
    setCurrentVersion(value)
    api.setCompilerParameters({ version: value })
  }

  const modal = async (title: string, message: string | JSX.Element, okLabel: string, okFn: () => void, cancelLabel?: string, cancelFn?: () => void) => {
    await setState(prevState => {
      return {
        ...prevState,
        modal: {
          ...prevState.modal,
          hide: false,
          message,
          title,
          okLabel,
          okFn,
          cancelLabel,
          cancelFn
        }
      }
    })
  }

  const handleHideModal = () => {
    setState(prevState => {
      return { ...prevState, modal: { ...state.modal, hide: true, message: null } }
    })
  }

  const panicMessage = (message: string) => (
    <div>
      <i className="fas fa-exclamation-circle remixui_panicError" aria-hidden="true"></i>
      The compiler returned with the following internal error: <br /> <b>{message}.<br />
      The compiler might be in a non-sane state, please be careful and do not use further compilation data to deploy to mainnet.
      It is heavily recommended to use another browser not affected by this issue (Firefox is known to not be affected).</b><br />
      Please join <a href="https://gitter.im/ethereum/remix" target="blank" >remix gitter channel</a> for more information.
    </div>
  )

  return (
    <>
      <div id="compileTabView">
        <CompilerContainer
          api={api}
          isHardhatProject={state.isHardhatProject}
          workspaceName={state.workspaceName}
          isTruffleProject={state.isTruffleProject}
          compileTabLogic={compileTabLogic}
          tooltip={toast}
          modal={modal}
          compiledFileName={currentFile}
          updateCurrentVersion={updateCurrentVersion}
          configurationSettings={configurationSettings}
          configFilePath={state.configFilePath}
          setConfigFilePath={setConfigFilePath}
        />
        { contractsFile[currentFile] && contractsFile[currentFile].contractsDetails && <ContractSelection api={api} contractsDetails={contractsFile[currentFile].contractsDetails} contractList={contractsFile[currentFile].contractList} modal={modal} /> }
        { compileErrors[currentFile] &&
          <div className="remixui_errorBlobs p-4" data-id="compiledErrors">
            <span data-id={`compilationFinishedWith_${currentVersion}`}></span>
            { compileErrors[currentFile].error && <Renderer message={compileErrors[currentFile].error.formattedMessage || compileErrors[currentFile].error} plugin={api} opt={{ type: compileErrors[currentFile].error.severity || 'error', errorType: compileErrors[currentFile].error.type }} /> }
            { compileErrors[currentFile].error && (compileErrors[currentFile].error.mode === 'panic') && modal('Error', panicMessage(compileErrors[currentFile].error.formattedMessage), 'Close', null) }
            { compileErrors[currentFile].errors && compileErrors[currentFile].errors.length && compileErrors[currentFile].errors.map((err, index) => {
              if (hideWarnings) {
                if (err.severity !== 'warning') {
                  return <Renderer key={index} message={err.formattedMessage} plugin={api} opt={{ type: err.severity, errorType: err.type }} />
                }
              } else {
                return <Renderer key={index} message={err.formattedMessage} plugin={api} opt={{ type: err.severity, errorType: err.type }} />
              }
            }) }
          </div>
        }
      </div>
      <Toaster message={state.toasterMsg} />
      <ModalDialog
        id='workspacesModalDialog'
        title={ state.modal.title }
        message={ state.modal.message }
        hide={ state.modal.hide }
        okLabel={ state.modal.okLabel }
        okFn={ state.modal.okFn }
        cancelLabel={ state.modal.cancelLabel }
        cancelFn={ state.modal.cancelFn }
        handleHide={ handleHideModal }>
        { (typeof state.modal.message !== 'string') && state.modal.message }
      </ModalDialog>
    </>
  )
}

export default SolidityCompiler
