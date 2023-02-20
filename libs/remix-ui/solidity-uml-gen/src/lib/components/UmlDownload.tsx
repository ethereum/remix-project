import React, { Fragment } from 'react'
import { Dropdown } from 'react-bootstrap'

export default function UmlDownload() {

  const downloadAsPng = () => {
    // convert serialized svg to png and download

  }

  const downloadAsPdf = () => {
    // convert serialized svg to pdf and download
  }
  return(
    <Fragment>
      <Dropdown>
        <Dropdown.Toggle className="badge badge-info remixui_no-shadow p-2 rounded-circle mr-2">
          <i className="far fa-arrow-to-bottom align-item-center d-flex justify-content-center"></i>
        </Dropdown.Toggle>
        <Dropdown.Menu>
          <Dropdown.Item onClick={downloadAsPng}>Download as PNG</Dropdown.Item>
          <Dropdown.Divider />
          <Dropdown.Item onClick={downloadAsPdf}>Download as PDF</Dropdown.Item>
        </Dropdown.Menu>
      </Dropdown>
    </Fragment>
  )
}