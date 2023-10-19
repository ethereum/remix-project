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

export function Container () {
  const circuitApp = useContext(CircuitAppContext)

  const showCompilerLicense = (message = 'License not available') => {
    // @ts-ignore
    circuitApp.plugin.call('notification', 'modal', { id: 'modal_circuit_compiler_license', title: 'Compiler License', message })
  }

  const handleVersionSelect = (version: string) => {
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

  return (
    <section>
      <article>
        <div className="pt-0 circuit_section">
          <div className="mb-1">
            <label className="circuit_label form-check-label" htmlFor="versionSelector">
              <FormattedMessage id="circuit.compiler" />
            </label>
            <CustomTooltip placement="top" tooltipId="showCompilerTooltip" tooltipClasses="text-nowrap" tooltipText={'See compiler license'}>
              <span className="fa fa-file-text-o border-0 p-0 ml-2" onClick={() => showCompilerLicense()}></span>
            </CustomTooltip>
            <VersionList setVersion={handleVersionSelect} versionList={circuitApp.appState.versionList} currentVersion={circuitApp.appState.version} />
            <CompileOptions />
            <ConfigToggler>
              <Configurations />
            </ConfigToggler>
            <CircuitActions />
            <RenderIf condition={circuitApp.appState.signalInputs.length > 0}>
              <WitnessToggler>
                <WitnessSection plugin={circuitApp.plugin} signalInputs={circuitApp.appState.signalInputs} status={circuitApp.appState.status} />
              </WitnessToggler>
            </RenderIf>
            <RenderIf condition={circuitApp.appState.status !== 'compiling' && circuitApp.appState.status !== 'computing' && circuitApp.appState.status !== 'generating'}>
              <CompilerFeedback feedback={circuitApp.appState.feedback} filePathToId={circuitApp.appState.filePathToId} openErrorLocation={handleOpenErrorLocation} />
            </RenderIf>
          </div>
        </div>
      </article>
    </section>
  )
}