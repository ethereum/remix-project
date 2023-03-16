import React, { useState } from "react"

import {
  PluginClient,
} from "@remixproject/plugin"
import { Formik, ErrorMessage, Field } from "formik"

import { SubmitButton } from "../components"
import { Receipt } from "../types"
import { verify } from "../utils/verify"
import { receiptGuidScript, verifyScript } from "../utils/scripts"

interface Props {
  client: PluginClient
  apiKey: string
  onVerifiedContract: (receipt: Receipt) => void
  contracts: string[]
}

interface FormValues {
  contractName: string
  contractArguments: string
  contractAddress: string
}

export const VerifyView: React.FC<Props> = ({
  apiKey,
  client,
  contracts,
  onVerifiedContract,
}) => {
  const [results, setResults] = useState("")

  const onVerifyContract = async (values: FormValues) => {
    const compilationResult = (await client.call(
      "solidity",
      "getCompilationResult"
    )) as any

    if (!compilationResult) {
      throw new Error("no compilation result available")
    }

    const contractArguments = values.contractArguments.replace("0x", "")    

    const verificationResult = await verify(
      apiKey,
      values.contractAddress,
      contractArguments,
      values.contractName,
      compilationResult,
      client,
      onVerifiedContract,
      setResults,
    )

    setResults(verificationResult.message)
  }

  return (
    <div>
      <Formik
        initialValues={{
          contractName: "",
          contractArguments: "",
          contractAddress: "",
        }}
        validate={(values) => {
          const errors = {} as any
          if (!values.contractName) {
            errors.contractName = "Required"
          }
          if (!values.contractAddress) {
            errors.contractAddress = "Required"
          }
          if (values.contractAddress.trim() === "") {
            errors.contractAddress = "Please enter a valid contract address"
          }
          return errors
        }}
        onSubmit={(values) => onVerifyContract(values)}
      >
        {({ errors, touched, handleSubmit, isSubmitting }) => (
          <form onSubmit={handleSubmit}>
            <h6>Verify your smart contracts</h6>
            <button
              type="button"
              style={{ padding: "0.25rem 0.4rem", marginRight: "0.5em", marginBottom: "0.5em"}}
              className="btn btn-primary"
              title="Generate the necessary helpers to start the verification from a TypeScript script"
              onClick={async () => {
                if (!await client.call('fileManager', 'exists' as any, 'scripts/etherscan/receiptStatus.ts')) {
                  await client.call('fileManager', 'writeFile', 'scripts/etherscan/receiptStatus.ts', receiptGuidScript)
                  await client.call('fileManager', 'open', 'scripts/etherscan/receiptStatus.ts')
                } else {
                  client.call('notification' as any, 'toast', 'file receiptStatus.ts already present..')
                }
                
                if (!await client.call('fileManager', 'exists' as any, 'scripts/etherscan/verify.ts')) {
                  await client.call('fileManager', 'writeFile', 'scripts/etherscan/verify.ts', verifyScript)
                  await client.call('fileManager', 'open', 'scripts/etherscan/verify.ts')
                } else {
                  client.call('notification' as any, 'toast', 'file verify.ts already present..')
                }
              }}
              >
                Generate Etherscan helper scripts
              </button>
            <div className="form-group">
              <label htmlFor="contractName">Contract</label>              
              <Field
                as="select"
                className={
                  errors.contractName && touched.contractName
                    ? "form-control form-control-sm is-invalid"
                    : "form-control form-control-sm"
                }
                name="contractName"
              >
                <option disabled={true} value="">
                  Select a contract
                </option>
                {contracts.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </Field>
              <ErrorMessage
                className="invalid-feedback"
                name="contractName"
                component="div"
              />
            </div>

            <div className="form-group">
              <label htmlFor="contractArguments">Constructor Arguments</label>
              <Field
                className={
                  errors.contractArguments && touched.contractArguments
                    ? "form-control form-control-sm is-invalid"
                    : "form-control form-control-sm"
                }
                type="text"
                name="contractArguments"
                placeholder="hex encoded"
              />
              <ErrorMessage
                className="invalid-feedback"
                name="contractArguments"
                component="div"
              />
            </div>

            <div className="form-group">
              <label htmlFor="contractAddress">Contract Address</label>
              <Field
                className={
                  errors.contractAddress && touched.contractAddress
                    ? "form-control form-control-sm is-invalid"
                    : "form-control form-control-sm"
                }
                type="text"
                name="contractAddress"
                placeholder="i.e. 0x11b79afc03baf25c631dd70169bb6a3160b2706e"
              />
              <ErrorMessage
                className="invalid-feedback"
                name="contractAddress"
                component="div"
              />
            </div>

            <SubmitButton dataId="verify-contract" text="Verify Contract" isSubmitting={isSubmitting} />
          </form>
        )}
      </Formik>

      <div data-id="verify-result"
        style={{ marginTop: "2em", fontSize: "0.8em", textAlign: "center" }}
        dangerouslySetInnerHTML={{ __html: results }}
      />

      {/* <div style={{ display: "block", textAlign: "center", marginTop: "1em" }}>
        <Link to="/receipts">View Receipts</Link>
      </div> */}
    </div>
  )
}
