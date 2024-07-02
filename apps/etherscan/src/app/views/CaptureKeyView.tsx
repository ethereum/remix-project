import React, {useState, useEffect} from 'react'

import {Formik, ErrorMessage, Field} from 'formik'
import {useNavigate, useLocation} from 'react-router-dom'

import {AppContext} from '../AppContext'
import {SubmitButton} from '../components'

export const CaptureKeyView = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const [msg, setMsg] = useState('')
  const context = React.useContext(AppContext)

  useEffect(() => {
    if (!context.apiKey) setMsg('Please provide a 34 or 32 character API key to continue')
  }, [context.apiKey])

  return (
    <div>
      <Formik
        initialValues={{apiKey: context.apiKey}}
        validate={(values) => {
          const errors = {} as any
          if (!values.apiKey) {
            errors.apiKey = 'Required'
          } else if (values.apiKey.length !== 34 && values.apiKey.length !== 32) {
            errors.apiKey = 'API key should be 34 or 32 characters long'
          }
          return errors
        }}
        onSubmit={(values) => {
          const apiKey = values.apiKey
          if (apiKey.length === 34 || apiKey.length === 32) {
            context.setAPIKey(values.apiKey)
            navigate(location && location.state ? location.state : '/')
          }
        }}
      >
        {({errors, touched, handleSubmit}) => (
          <form onSubmit={handleSubmit}>
            <div className="form-group mb-2">
              <label htmlFor="apikey">API Key</label>
              <Field
                className={errors.apiKey && touched.apiKey ? 'form-control form-control-sm is-invalid' : 'form-control form-control-sm'}
                type="password"
                name="apiKey"
                placeholder="e.g. GM1T20XY6JGSAPWKDCYZ7B2FJXKTJRFVGZ"
              />
              <ErrorMessage className="invalid-feedback" name="apiKey" component="div" />
            </div>

            <div>
              <SubmitButton text="Save" dataId="save-api-key" disable={errors && errors.apiKey ? true : false} />
            </div>
          </form>
        )}
      </Formik>

      <div data-id="api-key-result" className="text-primary mt-4 text-center" style={{fontSize: '0.8em'}} dangerouslySetInnerHTML={{__html: msg}} />
    </div>
  )
}
