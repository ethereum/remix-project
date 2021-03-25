import React from 'react'
import Checkbox from './Checkbox/StaticAnalyserCheckedBox'
import RadioButton from './RadioButton/StaticAnalysisRadioButton'

interface RenderModuleProops {
  groupedModules: any
}

const RenderModules = ({ groupedModules }: RenderModuleProops) => {
  console.log({ groupedModules }, ' Render Module')
  const moduleEntries = Object.keys(groupedModules).map((categoryId, i) => {
    const category = groupedModules[categoryId]
    const entriesDom = category.map((item, i) => {
      return (
        <div className="form-check" key={i}>
          <Checkbox
            id={`staticanalysismodule_${categoryId}_${i}`}
            inputType="checkbox"
            // className="form-check-input staticAnalysisItem"
            name="staticanalysismodule"
            // index={item._index}
            checked={true}
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
      <div className="${css.block}" key={i}>
        <RadioButton
          onClick={() => {}}
          category={category}
          entriesDom={entriesDom}
          categoryId={categoryId}
        />
        {/* <label
          htmlFor={`heading${categoryId}`}
          style={{ cursor: 'pointer' }}
          className="pl-3 card-header h6 d-flex justify-content-between font-weight-bold border-left px-1 py-2 w-100"
        >
          ${}
          <div>
            <i className="fas fa-angle-double-right"></i>
          </div>
        </label> */}
        {/* <div className="w-100 d-block px-2 my-1 ${css.entries}">
          ${entriesDom}
        </div> */}
      </div>
    )
  })

  // moduleEntries[0].getElementsByTagName('input')[0].checked = true
  // moduleEntries[0].getElementsByTagName('i')[0].hidden = true

  return (
    <div className="accordion" id="accordionModules">
      {console.log(
        moduleEntries
      )}
      {moduleEntries}
    </div>
  )
}

export default RenderModules
