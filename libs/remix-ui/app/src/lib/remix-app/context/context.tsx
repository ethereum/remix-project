import React from 'react'

const AppContext = React.createContext<{layout: any, settings: any, showMatamo: boolean, appManager: any}>(null)

export default AppContext
