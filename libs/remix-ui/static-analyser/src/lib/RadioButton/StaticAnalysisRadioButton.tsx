import React from 'react'
import './StaticAnalysisRadioButton.css'

interface StaticAnalysisRadioButtonProps {
  categoryId: string
  onClick: () => void
  entriesDom: any
  category: any[]
}

function StaticAnalysisRadioButton ({
  categoryId,
  onClick,
  entriesDom,
  category
}: StaticAnalysisRadioButtonProps) {
  return (
    <div className="block">
      <input
        type="radio"
        name="accordion"
        className="w-100 d-none card"
        id={`heading${categoryId}`}
        onClick={onClick}
      />
      <label
        htmlFor={`heading${categoryId}`}
        style={{ cursor: 'pointer' }}
        className="pl-3 card-header h6 d-flex justify-content-between font-weight-bold border-left px-1 py-2 w-100"
      >
        {category[0].categoryDisplayName}
        <div>
          <i className="fas fa-angle-double-right"></i>
        </div>
      </label>
      <div className="w-100 d-block px-2 my-1 entries">{entriesDom}</div>
    </div>
  )
}

export default StaticAnalysisRadioButton
