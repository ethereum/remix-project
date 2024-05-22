import { useContext } from 'react'
import { CustomTooltip, RenderIf } from '@remix-ui/helper'
import {FormattedMessage} from 'react-intl'
import { CircuitAppContext } from '../contexts'
import { CompileOptions } from './options'
import { VersionList } from './versions'
import { ConfigToggler } from './configToggler'
import { Configurations } from './configurations'
import { CircuitActions } from './actions'
import { WitnessToggler } from './witnessToggler'
import { WitnessSection } from './witness'
import { CompilerFeedback } from './feedback'
import { CompilerReport, PrimeValue } from '../types'

export function Container () {
  const circuitApp = useContext(CircuitAppContext)

  const showCompilerLicense = async (message = 'License not available') => {
    try {
      const response = await fetch('https://raw.githubusercontent.com/iden3/circom/master/COPYING')
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`)
      const content = await response.text()
      // @ts-ignore
      circuitApp.plugin.call('notification', 'modal', { id: 'modal_circuit_compiler_license', title: 'Compiler License', message: content })
    } catch (e) {
      // @ts-ignore
      circuitApp.plugin.call('notification', 'modal', { id: 'modal_circuit_compiler_license', title: 'Compiler License', message })
    }
  }

  const handleVersionSelect = (version: string) => {
    circuitApp.plugin.compilerVersion = version
    circuitApp.dispatch({ type: 'SET_COMPILER_VERSION', payload: version })
  }

  const handleOpenErrorLocation = async (location: string, startRange: string) => {
    if (location) {
      const fullPathLocation = await circuitApp.plugin.resolveReportPath(location)

      await circuitApp.plugin.call('fileManager', 'open', fullPathLocation)
      // @ts-ignore
      const startPosition: { lineNumber: number; column: number } = await circuitApp.plugin.call('editor', 'getPositionAt', startRange)
      // @ts-ignore
      await circuitApp.plugin.call('editor', 'gotoLine', startPosition.lineNumber - 1, startPosition.column)
    }
  }

  const handlePrimeChange = (value: PrimeValue) => {
    circuitApp.plugin.compilerPrime = value
    circuitApp.dispatch({ type: 'SET_PRIME_VALUE', payload: value as PrimeValue })
  }

  const handleCircuitAutoCompile = (value: boolean) => {
    circuitApp.dispatch({ type: 'SET_AUTO_COMPILE', payload: value })
  }

  const handleCircuitHideWarnings = (value: boolean) => {
    circuitApp.dispatch({ type: 'SET_HIDE_WARNINGS', payload: value })
  }

  const askGPT = async (report: CompilerReport) => {
    if (report.labels.length > 0) {
      const location = circuitApp.appState.filePathToId[report.labels[0].file_id]
      const error = report.labels[0].message

      if (location) {
        const fullPathLocation = await circuitApp.plugin.resolveReportPath(location)
        const content = await circuitApp.plugin.call('fileManager', 'readFile', fullPathLocation)
        const message = `
          circom code: ${content}
          error message: ${error}
          full circom error: ${JSON.stringify(report, null, 2)}
          explain why the error occurred and how to fix it.
          `
        // @ts-ignore
        await circuitApp.plugin.call('solcoder', 'error_explaining', message)
      } else {
        const message = `
          error message: ${error}
          full circom error: ${JSON.stringify(report, null, 2)}
          explain why the error occurred and how to fix it.
          `
        // @ts-ignore
        await circuitApp.plugin.call('solcoder', 'error_explaining', message)
      }
    } else {
      const error = report.message
      const message = `
      error message: ${error}
      full circom error: ${JSON.stringify(report, null, 2)}
      explain why the error occurred and how to fix it.
      `
      // @ts-ignore
      await circuitApp.plugin.call('solcoder', 'error_explaining', message)
    }
  }

  return (
    <section>
      <article>
        <div className="pt-0 circuit_section">
          <div className="mb-1">
            <label className="circuit_label form-check-label">
              <FormattedMessage id="circuit.compiler" />
            </label>
            <CustomTooltip
              placement="bottom"
              tooltipId="showCircumCompilerTooltip"
              tooltipClasses="text-nowrap"
              tooltipText='See compiler license'
            >
              <span className="far fa-file-certificate border-0 p-0 ml-2" onClick={() => showCompilerLicense()}></span>
            </CustomTooltip>
            <VersionList setVersion={handleVersionSelect} versionList={circuitApp.appState.versionList} currentVersion={circuitApp.appState.version} />
            <CompileOptions setCircuitAutoCompile={handleCircuitAutoCompile} setCircuitHideWarnings={handleCircuitHideWarnings} autoCompile={circuitApp.appState.autoCompile} hideWarnings={circuitApp.appState.hideWarnings} />
            <ConfigToggler>
              <Configurations setPrimeValue={handlePrimeChange} primeValue={circuitApp.appState.primeValue} versionValue={circuitApp.appState.version} />
            </ConfigToggler>
            <CircuitActions />
            <RenderIf condition={circuitApp.appState.signalInputs.length > 0}>
              <WitnessToggler>
                <WitnessSection plugin={circuitApp.plugin} signalInputs={circuitApp.appState.signalInputs} status={circuitApp.appState.status} />
              </WitnessToggler>
            </RenderIf>
            <RenderIf condition={(circuitApp.appState.status !== 'compiling') && (circuitApp.appState.status !== 'computing') && (circuitApp.appState.status !== 'generating')}>
              <CompilerFeedback feedback={circuitApp.appState.feedback} filePathToId={circuitApp.appState.filePathToId} openErrorLocation={handleOpenErrorLocation} hideWarnings={circuitApp.appState.hideWarnings} askGPT={askGPT} />
            </RenderIf>
          </div>
        </div>
      </article>
    </section>
  )
}