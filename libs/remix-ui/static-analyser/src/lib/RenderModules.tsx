import React, {useState} from 'react'
import Checkbox from './Checkbox/StaticAnalyserCheckedBox'
import CategorySection from './RadioButton/StaticAnalysisRadioButton'

interface RenderModuleProps {
  groupedModules: any
  checkAll: boolean;
  checkAllCategory: boolean
  //CheckboxCategory: React.ReactNode;

}

const RenderModules = ({ groupedModules, checkAll, checkAllCategory }: RenderModuleProps) => {
  const [checkCategories, setCheckCategories] = useState(false)

  const handleCheckCategory = () => {
    setCheckCategories(prevState => !prevState)
  }

  console.log({ groupedModules }, ' Render Module')
  const moduleEntries = Object.keys(groupedModules).map((categoryId, i) => {
    const category = groupedModules[categoryId]
    console.log({category}, " category")
 
    return (
      <div className="${css.block}" key={i}>
        <CategorySection
          onClick={handleCheckCategory}
          category={category}
          entriesDom={category}
          categoryId={categoryId}
          checkAll={checkAll}
         // CheckboxCategory={<Checkbox />}
          checkAllCategory={checkAllCategory}
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
