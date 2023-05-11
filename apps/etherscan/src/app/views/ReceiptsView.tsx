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
  const [results, setResults] = useState({succeed: false, message: ''})
  const onGetReceiptStatus = async (
    values: FormValues,
    clientInstance: any,
    apiKey: string
  ) => {
    try {
      const network = await getNetworkName(clientInstance)
      if (network === "vm") {
        setResults({
          succeed: false,
          message: "Cannot verify in the selected network"
      })
        return
      }
      const etherscanApi = getEtherScanApi(network)
      const result = await getReceiptStatus(
        values.receiptGuid,
        apiKey,
        etherscanApi
      )
      setResults({
        succeed: result.status === '1' ? true : false,
        message: result.result
      })
    } catch (error: any) {
      setResults({
        succeed: false,
        message: error.message
      })
    }
  }

  return (
    <AppContext.Consumer>
      {({ apiKey, clientInstance, receipts }) => {
        if (!apiKey && clientInstance && clientInstance.call) clientInstance.call('notification' as any, 'toast', 'Please add API key to continue')
        return !apiKey ? (
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
                  <SubmitButton text="Check" disable = {!touched.receiptGuid || (touched.receiptGuid && errors.receiptGuid) ? true : false} />
                </form>
              )}
            </Formik>

            <div
              style={{
                marginTop: "2em",
                fontSize: "0.8em",
                textAlign: "center",
                color: results['succeed'] ? "green" : "red"
              }}
              dangerouslySetInnerHTML={{ __html: results.message ? results.message : '' }}
            />

            <ReceiptsTable receipts={receipts} />
          </div>
        )
      }
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
            <th scope="col">Status</th>
            <th scope="col">GUID</th>
          </tr>
        </thead>
        <tbody>
          {receipts &&
            receipts.length > 0 &&
            receipts.map((item: Receipt, index) => {
              return (
                <tr key={item.guid}>
                  <td className={item.status === 'Pass - Verified' 
                  ? 'text-success' : (item.status === 'Pending in queue' 
                  ? 'text-warning' : (item.status === 'Already Verified'
                  ? 'text-info': 'text-secondary'))}>{item.status}</td>
                  <td>{item.guid}</td>
                </tr>
              )
            })}
        </tbody>
      </table>
    </div>
  )
}
