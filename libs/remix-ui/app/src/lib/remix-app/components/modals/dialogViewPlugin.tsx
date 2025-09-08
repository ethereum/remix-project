import React, { useContext, useEffect } from 'react'
import { AppContext } from '../../context/context'
import { useDialogDispatchers } from '../../context/provider'

const DialogViewPlugin = () => {
  const { modal, alert, toast, templateExplorer } = useDialogDispatchers()
  const app = useContext(AppContext)

  useEffect(() => {
    app.modal.setDispatcher({ modal, alert, toast, templateExplorer })
  }, [])
  return <></>
}

export default DialogViewPlugin
