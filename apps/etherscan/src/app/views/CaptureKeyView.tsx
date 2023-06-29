import React from "react"

import { Formik, ErrorMessage, Field } from "formik"
import { useNavigate, useLocation } from "react-router-dom"

import { AppContext } from "../AppContext"
import { SubmitButton } from "../components"

export const CaptureKeyView: React.FC = () => {
  const location = useLocation()
  const navigate = useNavigate()
  return (
    <AppContext.Consumer>
      {({ apiKey, clientInstance, setAPIKey }) => {
        if (!apiKey && clientInstance && clientInstance.call) {
          clientInstance.call('sidePanel' as any, 'currentFocus').then((current) => {
            if (current === 'etherscan') clientInstance.call('notification' as any, 'toast', 'Please add API key to continue')
          })
        }
        return <Formik
          initialValues={{ apiKey }}
          validate={(values) => {
            const errors = {} as any
            if (!values.apiKey) {
              errors.apiKey = "Required"
            } else if (values.apiKey.length !== 34) {
              errors.apiKey = "API key should be 34 characters long"
            }
            return errors
          }}
          onSubmit={(values) => {
            const apiKey = values.apiKey
            if (apiKey.length === 34) {
              setAPIKey(values.apiKey)
              clientInstance.call('notification' as any, 'toast', 'API key saved successfully!!!')
              navigate((location && location.state ? location.state : '/'))
            }
          }}
        >
          {({ errors, touched, handleSubmit }) => (
            <form onSubmit={handleSubmit}>
              <div className="form-group mb-2">
                <label htmlFor="apikey">API Key</label>
                <Field
                  className={
                    errors.apiKey && touched.apiKey
                      ? "form-control form-control-sm is-invalid"
                      : "form-control form-control-sm"
                  }
                  type="password"
                  name="apiKey"
                  placeholder="e.g. GM1T20XY6JGSAPWKDCYZ7B2FJXKTJRFVGZ"
                />
                <ErrorMessage
                  className="invalid-feedback"
                  name="apiKey"
                  component="div"
                />
              </div>

              <div>
                <SubmitButton text="Save" dataId="save-api-key" disable={ errors && errors.apiKey ? true : false } />
              </div>
            </form>
          )}
        </Formik>
      }}
    </AppContext.Consumer>
  )
}
