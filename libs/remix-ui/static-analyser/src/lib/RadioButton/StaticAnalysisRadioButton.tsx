import React, {useState, useEffect, Component} from 'react'
import Checkbox from '../Checkbox/StaticAnalyserCheckedBox'
import './StaticAnalysisRadioButton.css'

interface StaticAnalysisRadioButtonProps {
  categoryId: string
  onClick: () => void
  entriesDom: any
  category: any[]
  checkAllCategory: boolean
  CheckboxCategory?: Component
  checkAll: boolean
}

function  StaticAnalysisRadioButton ({
  categoryId,
  checkAll,
  onClick,
  entriesDom,
  category,
 // CheckboxCategory
}: StaticAnalysisRadioButtonProps) {

  const [checkAllCategory, setCheckAllCategory] = useState('')

  const handleCheckCategory = (categoryId) => {
    
    if (checkAll) {
      setCheckAllCategory(categoryId)
    }

    
  }

    const checkAllSection = (id) => {
    if(checkAll) {
      return true
    } else {
      return false
    } 
  }

  useEffect(() => {
    checkAllSection(categoryId);
    return () => {
    
    }
  }, [checkAllSection])


  
  console.log({checkAllSection})

     const categories = entriesDom.map((item, i) => {
      
      return (
        <div className="form-check" key={i}>
          <Checkbox
            categoryId={categoryId}
            id={`staticanalysismodule_${categoryId}_${i}`}
            inputType="checkbox"
            // className="form-check-input staticAnalysisItem"
            name="checkSingleEntry"
            // index={item._index}
            checked={checkAll ? true : false}
            itemName={item.name}
            label={item.description}
            // style={{ verticalAlign: 'bottom' }}
            //onClick={event => this.checkModule(event)}
            onClick={() => {}}
            onChange={() => {}}
          />
          {/* <label
            htmlFor={`staticanalysismodule_${categoryId}_${i}`}
            className="form-check-label mb-1"
          >
            <p className="mb-0 font-weight-bold text-capitalize">{item.name}</p>
            ${}
          </label> */}
        </div>
      )
    })

  return (
    <div className="block">
      <input
        type="radio"
        className="w-100 d-none card"
        id={`heading${categoryId}`}
        onClick={onClick}
      />
      <label
        htmlFor={`heading${categoryId}`}
        style={{ cursor: 'pointer' }}
        className="pl-3 card-header h6 d-flex justify-content-between font-weight-bold border-left px-1 py-2 w-100"
        data-bs-toggle="collapse"
        data-bs-expanded="false"
        data-bs-controls={`heading${categoryId}`}
        data-bs-target={`#heading${categoryId}`}
      >
        {category[0].categoryDisplayName}
        <div>
          <i className="fas fa-angle-double-right"></i>
        </div>
      </label>
      <div onClick={() => handleCheckCategory(categoryId)}>
        <Checkbox onClick={() =>{}} onChange={() => { }} checked={checkAllSection(categoryId)} id={categoryId} inputType="checkbox" label={`Select ${category[0].categoryDisplayName}`} name='checkCategoryEntry'/>
      </div>
      <div className="w-100 d-block px-2 my-1 entries collapse multi-collapse" id={`heading${categoryId}`}>{categories}</div>
    </div>
  )
}

export default StaticAnalysisRadioButton
