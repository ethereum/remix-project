import React from 'react'
import Form from 'react-bootstrap/Form'

interface Props {
  url: string
  setUrl: (url: string) => void
  environment: 'remote' | 'local'
}

function LocalUrlInput({url, setUrl, environment}: Props) {
  if (environment === 'remote') {
    return <></>
  }

  function updateUrl(event: React.FocusEvent<HTMLInputElement>) {
    setUrl(event.target.value)
  }

  return (
    <Form id="local-url" className="w-100 px-3">
      <Form.Group controlId="localUrl">
        <Form.Text className="text-warning pb-2">{'Currently we support vyper version > 0.2.16'}</Form.Text>
        <Form.Label>Local Compiler Url</Form.Label>
        <Form.Control onBlur={updateUrl} defaultValue={url} type="email" placeholder="eg http://localhost:8000/compile" />
        <Form.Text className="text-muted"></Form.Text>
      </Form.Group>
    </Form>
  )
}

export default LocalUrlInput
