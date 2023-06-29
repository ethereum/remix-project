import React, { useState } from "react"

import { Formik, ErrorMessage, Field } from "formik"
import { getEtherScanApi, getNetworkName, getReceiptStatus, getProxyContractReceiptStatus } from "../utils"
import { Receipt } from "../types"
import { AppContext } from "../AppContext"
import { SubmitButton } from "../components"
import { Navigate } from "react-router-dom"
import { Button } from "react-bootstrap"
import { CustomTooltip } from '@remix-ui/helper'

interface FormValues {
  receiptGuid: string
}

export const ReceiptsView: React.FC = () => {
  const [results, setResults] = useState({succeed: false, message: ''})
  const [isProxyContractReceipt, setIsProxyContractReceipt] = useState(false)

  const onGetReceiptStatus = async (
    values: FormValues,
    clientInstance: any,
    apiKey: string
  ) => {
    try {
      const { network, networkId } = await getNetworkName(clientInstance)
      if (network === "vm") {
        setResults({
          succeed: false,
          message: "Cannot verify in the selected network"
        })
        return
      }
      const etherscanApi = getEtherScanApi(networkId)
      let result
      if (isProxyContractReceipt) {
        result = await getProxyContractReceiptStatus(
          values.receiptGuid,
          apiKey,
          etherscanApi
        )
        if (result.status === '1') {
          result.message = result.result
          result.result = 'Successfully Updated'
        }
      } else
        result = await getReceiptStatus(
          values.receiptGuid,
          apiKey,
          etherscanApi
        )
      setResults({
        succeed: result.status === '1' ? true : false,
        message: result.result || (result.status === '0' ? 'Verification failed' : result.message)
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
      {({ apiKey, clientInstance, receipts, setReceipts }) => {
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
              {({ errors, touched, handleSubmit, handleChange }) => (
                <form onSubmit={handleSubmit}>
                  <div className="form-group mb-2">
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

                  <div className="d-flex mb-2 custom-control custom-checkbox">
                    <Field
                      className="custom-control-input"
                      type="checkbox"
                      name="isProxyReceipt"
                      id="isProxyReceipt"
                      onChange={async (e) => {
                        handleChange(e)
                        if (e.target.checked) setIsProxyContractReceipt(true)
                        else setIsProxyContractReceipt(false)
                    }}
                    />
                    <label className="form-check-label custom-control-label" htmlFor="isProxyReceipt">It's a proxy contract GUID</label>
                  </div>
                  <SubmitButton text="Check" disable = {!touched.receiptGuid || (touched.receiptGuid && errors.receiptGuid) ? true : false} />
                </form>
              )}
            </Formik>

            <div
              className={results['succeed'] ? "text-success mt-3 text-center" : "text-danger mt-3 text-center"}
              dangerouslySetInnerHTML={{ __html: results.message ? results.message : '' }}
            />

            <ReceiptsTable receipts={receipts} /><br/>
            <CustomTooltip
              tooltipText="Clear the list of receipts"
              tooltipId='etherscan-clear-receipts'
              placement='bottom'
            >
              <Button className="btn-sm" onClick={() => { setReceipts([]) }} >Clear</Button>
            </CustomTooltip>
          </div>
        )
      }
      }
    </AppContext.Consumer>
  )
}

const ReceiptsTable: React.FC<{ receipts: Receipt[] }> = ({ receipts }) => {
  return (
    <div className="table-responsive">
      <h6>Receipts</h6>
      <table className="table h6 table-sm">
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
                  <td className={(item.status === 'Pass - Verified' || item.status === 'Successfully Updated')
                  ? 'text-success' : (item.status === 'Pending in queue' 
                  ? 'text-warning' : (item.status === 'Already Verified'
                  ? 'text-info': 'text-secondary'))}>
                    {item.status}
                    {item.status === 'Successfully Updated' && <CustomTooltip
                      placement={'bottom'}
                      tooltipClasses="text-wrap"
                      tooltipId="etherscan-receipt-proxy-status"
                      tooltipText={item.message}
                    >
                      <i style={{ fontSize: 'small' }} className={'ml-1 fal fa-info-circle align-self-center'} aria-hidden="true"></i>
                    </CustomTooltip>
                    }
                  </td>
                  <td>{item.guid}</td>
                </tr>
              )
            })}
        </tbody>
      </table>
    </div>
  )
}
