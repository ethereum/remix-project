import { useContext } from 'react'
import { CompileBtn, CompilerFeedback, CompilerReport, CustomTooltip, extractNameFromKey, RenderIf } from '@remix-ui/helper'
import { FormattedMessage } from 'react-intl'
import { NoirAppContext } from '../contexts'
import { CompileOptions } from '@remix-ui/helper'
import { compileNoirCircuit } from '../actions'

export function Container () {
  const noirApp = useContext(NoirAppContext)

  const showCompilerLicense = async (message = 'License not available') => {
    try {
      const response = await fetch('https://raw.githubusercontent.com/noir-lang/noir/master/LICENSE-APACHE')
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`)
      const content = await response.text()
      // @ts-ignore
      noirApp.plugin.call('notification', 'modal', { id: 'modal_noir_compiler_license', title: 'Compiler License', message: content })
    } catch (e) {
      // @ts-ignore
      noirApp.plugin.call('notification', 'modal', { id: 'modal_noir_compiler_license', title: 'Compiler License', message })
    }
  }

  const handleOpenErrorLocation = async (report: CompilerReport) => {}

  const handleCircuitAutoCompile = (value: boolean) => {
    noirApp.dispatch({ type: 'SET_AUTO_COMPILE', payload: value })
  }

  const handleCircuitHideWarnings = (value: boolean) => {
    noirApp.dispatch({ type: 'SET_HIDE_WARNINGS', payload: value })
  }

  const askGPT = async (report: CompilerReport) => {}

  const handleCompileClick = () => {
    compileNoirCircuit(noirApp.plugin, noirApp.appState)
  }

  const handleViewProgramArtefact = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault()
    noirApp.plugin.call('fileManager', 'open', 'build/program.json')
  }

  return (
    <section>
      <article>
        <div className="pt-0 noir_section">
          <div className="mb-1">
            <label className="noir_label form-check-label">
              <FormattedMessage id="noir.compiler" />
            </label>
            <CustomTooltip
              placement="bottom"
              tooltipId="showNoirCompilerTooltip"
              tooltipClasses="text-nowrap"
              tooltipText='See compiler license'
            >
              <span className="far fa-file-certificate border-0 p-0 ml-2" onClick={() => showCompilerLicense()}></span>
            </CustomTooltip>
            <CompileOptions setCircuitAutoCompile={handleCircuitAutoCompile} setCircuitHideWarnings={handleCircuitHideWarnings} autoCompile={noirApp.appState.autoCompile} hideWarnings={noirApp.appState.hideWarnings} />
            <div className="pb-2">
              <CompileBtn id="noir" plugin={noirApp.plugin} appState={noirApp.appState} compileAction={handleCompileClick} />
            </div>
            <RenderIf condition={noirApp.appState.status !== 'compiling'}>
              <CompilerFeedback feedback={noirApp.appState.compilerFeedback} filePathToId={noirApp.appState.filePathToId} openErrorLocation={handleOpenErrorLocation} hideWarnings={noirApp.appState.hideWarnings} askGPT={askGPT} />
            </RenderIf>
            <RenderIf condition={noirApp.appState.status === 'succeed'}>
              <a data-id="view-noir-compilation-result" className="cursor-pointer text-decoration-none" href='#' onClick={handleViewProgramArtefact}>
                <i className="text-success mt-1 px-1 fas fa-check"></i> View compiled noir program artefact.
              </a>
            </RenderIf>
          </div>
        </div>
      </article>
    </section>
  )
}
