function readAndCombineJsonFiles() {
  // @ts-expect-error
  const dataContext = require.context('./', true, /\.json$/)

  let combinedData = {}
  dataContext.keys().forEach((key) => {
    const jsonData = dataContext(key)
    combinedData = { ...combinedData, ...jsonData }
  })

  return combinedData
}

export default readAndCombineJsonFiles();
