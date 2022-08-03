import React, { useState } from "react"

import {
  PluginClient,
} from "@remixproject/plugin"
import { Formik, ErrorMessage, Field } from "formik"

import { getNetworkName, getEtherScanApi, getReceiptStatus } from "../utils"
import { SubmitButton } from "../components"
import { Receipt } from "../types"
import { CompilationResult } from "@remixproject/plugin-api"
import axios from 'axios'

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

export const getContractFileName = (
  compilationResult: CompilationResult,
  contractName: string
) => {
  const compiledContracts = compilationResult.contracts
  let fileName = ""

  for (const file of Object.keys(compiledContracts)) {
    for (const contract of Object.keys(compiledContracts[file])) {
      if (contract === contractName) {
        fileName = file
        break
      }
    }
  }
  return fileName
}

export const getContractMetadata = (
  compilationResult: CompilationResult,
  contractName: string
) => {
  const compiledContracts = compilationResult.contracts
  let contractMetadata = ""

  for (const file of Object.keys(compiledContracts)) {
    for (const contract of Object.keys(compiledContracts[file])) {
      if (contract === contractName) {
        contractMetadata = compiledContracts[file][contract].metadata
        if (contractMetadata) {
          break
        }
      }
    }
  }
  return contractMetadata
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

    const verify = async (
      apiKeyParam: string,
      contractAddress: string,
      contractArgumentsParam: string,
      contractName: string,
      compilationResultParam: any
    ) => {
      const network = await getNetworkName(client)
      if (network === "vm") {
        return "Cannot verify in the selected network"
      }
      const etherscanApi = getEtherScanApi(network)

      try {
        const contractMetadata = getContractMetadata(
          compilationResultParam.data,
          contractName
        )

        if (!contractMetadata) {
          return "Please recompile contract"
        }
        
        const contractMetadataParsed = JSON.parse(contractMetadata)

        const fileName = getContractFileName(
          compilationResultParam.data,
          contractName
        )

        const jsonInput = {
          language: 'Solidity',
          sources: compilationResultParam.source.sources,
          settings: {
            optimizer: {
              enabled: contractMetadataParsed.settings.optimizer.enabled,
              runs: contractMetadataParsed.settings.optimizer.runs
            }
          }
        }

        const data: { [key: string]: string | any } = {
          apikey: apiKeyParam, // A valid API-Key is required
          module: "contract", // Do not change
          action: "verifysourcecode", // Do not change
          codeformat: "solidity-standard-json-input",
          contractaddress: contractAddress, // Contract Address starts with 0x...
          sourceCode: JSON.stringify(jsonInput),
          contractname: fileName + ':' + contractName,
          compilerversion: `v${contractMetadataParsed.compiler.version}`, // see http://etherscan.io/solcversions for list of support versions
          constructorArguements: contractArgumentsParam, // if applicable
        }

        const body = new FormData()
        Object.keys(data).forEach((key) => body.append(key, data[key]))

        client.emit("statusChanged", {
          key: "loading",
          type: "info",
          title: "Verifying ...",
        })
        const response = await axios.post(etherscanApi, body)
        const { message, result, status } = await response.data

        if (message === "OK" && status === "1") {
          resetAfter10Seconds()
          const receiptStatus = await getReceiptStatus(
            result,
            apiKey,
            etherscanApi
          )

          onVerifiedContract({
            guid: result,
            status: receiptStatus,
          })
          return `Contract verified correctly <br> Receipt GUID ${result}`
        }
        if (message === "NOTOK") {
          client.emit("statusChanged", {
            key: "failed",
            type: "error",
            title: result,
          })
          resetAfter10Seconds()
        }
        return result
      } catch (error) {
        console.log("Error, something wrong happened", error)
        setResults("Something wrong happened, try again")
      }
    }

    const resetAfter10Seconds = () => {
      setTimeout(() => {
        client.emit("statusChanged", { key: "none" })
        setResults("")
      }, 10000)
    }

    const verificationResult = await verify(
      apiKey,
      values.contractAddress,
      contractArguments,
      values.contractName,
      compilationResult
    )

    setResults(verificationResult)
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
            <div className="form-group">
              <h6>Verify your smart contracts</h6>
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

            <SubmitButton text="Verify Contract" isSubmitting={isSubmitting} />
          </form>
        )}
      </Formik>

      <div
        style={{ marginTop: "2em", fontSize: "0.8em", textAlign: "center" }}
        dangerouslySetInnerHTML={{ __html: results }}
      />

      {/* <div style={{ display: "block", textAlign: "center", marginTop: "1em" }}>
        <Link to="/receipts">View Receipts</Link>
      </div> */}
    </div>
  )
}
