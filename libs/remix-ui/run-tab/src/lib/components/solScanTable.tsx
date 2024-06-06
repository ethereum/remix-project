// eslint-disable-next-line no-use-before-define
import React from 'react'
import parse from 'html-react-parser';

interface SolScanTableProps {
  scanDetails: Record<string, any>[],
  fileName: string
}

export function SolScanTable(props: SolScanTableProps) {
  const { scanDetails, fileName } = props

  return (
    <>
      <p>Scanning successful! <b>{scanDetails.length} warnings </b> found for file: <b>{fileName}</b></p>
      <p>See the warning details below. For more details, <a href="https://solidityscan.com/signup" target='blank'>Sign up with SolidityScan</a></p>
      <table className="table table-bordered table-hover">
        <thead>
          <tr>
            <td scope="col">NAME</td>
            <td scope="col">SEVERITY</td>
            <td scope="col">CONFIDENCE</td>
            <td scope="col">DESCRIPTION</td>
            <td scope="col">REMEDIATION</td>
          </tr>
        </thead>
        <tbody>
          {
            Array.from(scanDetails, (template) => {
              return (
                <tr key={template.template_details.issue_id}>
                  <td scope="col">{template.template_details.issue_name}</td>
                  <td scope="col">{template.template_details.issue_severity}</td>
                  <td scope="col">{template.template_details.issue_confidence}</td>
                  <td scope="col">{parse(template.template_details.static_issue_description)}</td>
                  <td scope="col">{template.template_details.issue_remediation ? parse(template.template_details.issue_remediation) : 'Not Available' }</td>
                </tr>
              )
            })
          }

        </tbody>
      </table>
    </>
  )
}
