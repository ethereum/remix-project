import enJson from '../en'

function readAndCombineJsonFiles() {
  const dataContext = require.context('./', true, /\.json$/)

  let combinedData = {}
  dataContext.keys().forEach((key) => {
    const jsonData = dataContext(key)
    combinedData = {...combinedData, ...jsonData}
  })

  return combinedData
}

// There may have some un-translated content. Always fill in the gaps with EN JSON.
// No need for a defaultMessage prop when render a FormattedMessage component.
export default Object.assign({}, enJson, readAndCombineJsonFiles())
