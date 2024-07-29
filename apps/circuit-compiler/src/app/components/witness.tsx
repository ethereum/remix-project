import { RenderIf, RenderIfNot } from "@remix-ui/helper";
import { FormattedMessage } from "react-intl";
import { CompilerStatus } from "../types";
import { computeWitness } from "../actions";
import { useState } from "react";
import type { CircomPluginClient } from "../services/circomPluginClient";
import * as remixLib from '@remix-project/remix-lib'

export function WitnessSection ({ plugin, signalInputs, status }: {plugin: CircomPluginClient, signalInputs: string[], status: CompilerStatus}) {
  const [witnessValues, setWitnessValues] = useState<Record<string, string>>({})

  const handleSignalInput = (e: any) => {
    let value = e.target.value

    if (value.startsWith('[') && value.endsWith(']')) {
      try {
        value = remixLib.execution.txFormat.parseFunctionParams(value)
      } catch (e) {
      // do nothing
      }
    } else if (value.startsWith('[') && !value.endsWith(']')) {
      // do nothing
    } else {
      try {
        value = remixLib.execution.txFormat.parseFunctionParams(value)
      } catch (e) {
      // do nothing
      }
    }
    setWitnessValues({
      ...witnessValues,
      [e.target.name]: value[0]
    })
  }

  return (
    <div className="flex-column d-flex">
      <RenderIf condition={signalInputs.length > 0}>
        <>
          {
            signalInputs.map((input, index) => (
              <div className="mb-2 ml-0" key={index}>
                <label className="circuit_inner_label form-check-label" htmlFor="circuitPrimeSelector">
                  <FormattedMessage id="circuit.signalInput" /> { input }
                </label>
                <input className="form-control m-0 txinput" placeholder={input} name={input} onChange={handleSignalInput} data-id={`circuit_input_${input}`} />
              </div>
            ))
          }
          <button
            className="btn btn-secondary btn-block d-block w-100 text-break mb-1 mt-1"
            onClick={() => { computeWitness(plugin, status, witnessValues) }}
            disabled={(status === "compiling") || (status === "computing")}
            data-id="compute_witness_btn"
          >
            <RenderIf condition={status === 'computing'}>
              <i className="fas fa-sync fa-spin mr-2" aria-hidden="true"></i>
            </RenderIf>
            <FormattedMessage id="circuit.compute" />
          </button>
        </>
      </RenderIf>
    </div>
  )
}