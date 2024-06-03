// eslint-disable-next-line no-use-before-define
import React from 'react'

interface SolScanTableProps {
  scanDetails: Record<string, any>[]
}

export function SolScanTable(props: SolScanTableProps) {
  const { scanDetails } = props

  return (
    <table className="table h6 table-sm">
      <thead>
        <tr>
          <td scope="col">ID</td>
          <td scope="col">NAME</td>
          <td scope="col">SEVERITY</td>
          <td scope="col">DESCRIPTION</td>
        </tr>
      </thead>
      <tbody>
        {
          Array.from(scanDetails, (template) => {
            return (
              <tr>
                <td scope="col">{template.template_details.issue_id}</td>
                <td scope="col">{template.template_details.issue_name}</td>
                <td scope="col">{template.template_details.issue_severity}</td>
                <td scope="col">{template.template_details.static_issue_description}</td>
              </tr>
            )
          })
        }

      </tbody>
    </table>
  )
}
