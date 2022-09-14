import React, { useState } from "react"

import { Formik, ErrorMessage, Field } from "formik"
import { getEtherScanApi, getNetworkName, getReceiptStatus } from "../utils"
import { Receipt } from "../types"
import { AppContext } from "../AppContext"
import { SubmitButton } from "../components"
import { Navigate } from "react-router-dom"

interface FormValues {
  receiptGuid: string
}

export const ReceiptsView: React.FC = () => {
  const [results, setResults] = useState("")
  const onGetReceiptStatus = async (
    values: FormValues,
    clientInstance: any,
    apiKey: string
  ) => {
    try {
      const network = await getNetworkName(clientInstance)
      if (network === "vm") {
        setResults("Cannot verify in the selected network")
        return
      }
      const etherscanApi = getEtherScanApi(network)
      const result = await getReceiptStatus(
        values.receiptGuid,
        apiKey,
        etherscanApi
      )
      setResults(result)
    } catch (error: any) {
      setResults(error.message)
    }
  }

  return (
    <AppContext.Consumer>
      {({ apiKey, clientInstance, receipts }) =>
        !apiKey ? (
          <Navigate
            to={{
              pathname: "/settings"
            }}
          />
        ) : (
          <div>
            <Formik
              initialValues={{ receiptGuid: "" }}
              validate={(values) => {
                const errors = {} as any
                if (!values.receiptGuid) {
                  errors.receiptGuid = "Required"
                }
                return errors
              }}
              onSubmit={(values) =>
                onGetReceiptStatus(values, clientInstance, apiKey)
              }
            >
              {({ errors, touched, handleSubmit }) => (
                <form onSubmit={handleSubmit}>
                  <div
                    className="form-group"
                    style={{ marginBottom: "0.5rem" }}
                  >
                    <h6>Get your Receipt GUID status</h6>
                    <label htmlFor="receiptGuid">Receipt GUID</label>
                    <Field
                      className={
                        errors.receiptGuid && touched.receiptGuid
                          ? "form-control form-control-sm is-invalid"
                          : "form-control form-control-sm"
                      }
                      type="text"
                      name="receiptGuid"
                    />
                    <ErrorMessage
                      className="invalid-feedback"
                      name="receiptGuid"
                      component="div"
                    />
                  </div>

                  <SubmitButton text="Check" />
                </form>
              )}
            </Formik>

            <div
              style={{
                marginTop: "2em",
                fontSize: "0.8em",
                textAlign: "center",
              }}
              dangerouslySetInnerHTML={{ __html: results }}
            />

            <ReceiptsTable receipts={receipts} />
          </div>
        )
      }
    </AppContext.Consumer>
  )
}

const ReceiptsTable: React.FC<{ receipts: Receipt[] }> = ({ receipts }) => {
  return (
    <div className="table-responsive" style={{ fontSize: "0.7em" }}>
      <h6>Receipts</h6>
      <table className="table table-sm">
        <thead>
          <tr>
            <th scope="col">Guid</th>
            <th scope="col">Status</th>
          </tr>
        </thead>
        <tbody>
          {receipts &&
            receipts.length > 0 &&
            receipts.map((item: Receipt, index) => {
              return (
                <tr key={item.guid}>
                  <td>{item.guid}</td>
                  <td>{item.status}</td>
                </tr>
              )
            })}
        </tbody>
      </table>
    </div>
  )
}
