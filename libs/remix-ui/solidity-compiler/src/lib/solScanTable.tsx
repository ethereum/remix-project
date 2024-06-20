// eslint-disable-next-line no-use-before-define
import React from 'react'
import parse from 'html-react-parser'
const _paq = (window._paq = window._paq || [])

interface SolScanTableProps {
  scanDetails: Record<string, any>[],
  fileName: string
}

export function SolScanTable(props: SolScanTableProps) {
  const { scanDetails, fileName } = props

  return (
    <>
      <p>Scanning successful! <b>{scanDetails.length} warnings </b> found for file: <b>{fileName}</b></p>
      <p>See the warning details below. For more details,&nbsp;
        <a href="https://solidityscan.com/signup"
          target='_blank'
          onClick={() => _paq.push(['trackEvent', 'udapp', 'solidityScan', 'goToSolidityScan'])}>
            go to SolidityScan.
        </a>
      </p>
      <table className="table table-bordered table-hover">
        <thead>
          <tr>
            <td scope="col" style={{ wordBreak: "keep-all" }}>NAME</td>
            <td scope="col" style={{ wordBreak: "keep-all" }}>SEVERITY</td>
            <td scope="col" style={{ wordBreak: "keep-all" }}>CONFIDENCE</td>
            <td scope="col" style={{ wordBreak: "keep-all" }}>DESCRIPTION</td>
            <td scope="col" style={{ wordBreak: "keep-all" }}>REMEDIATION</td>
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
