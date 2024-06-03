// eslint-disable-next-line no-use-before-define
import React from 'react'

interface SolScanTableProps {
  scanDetails: Record<string, any>[]
}

export function SolScanTable(props: SolScanTableProps) {

  return (
    <table className="table h6 table-sm">
        <thead>
            <tr>
                <td scope="col">h1</td>
                <td scope="col">h2</td>
            </tr>
        </thead>
        <tbody>
            <tr>
                <td scope="col">r1</td>
                <td scope="col">r2</td>
            </tr>
        </tbody>
    </table>
  )
}
