import { useDialogDispatchers } from 'libs/remix-ui/app/src/lib/remix-app/context/provider'
import React, { useContext, useEffect, useRef, useState } from 'react' // eslint-disable-line
import { PermissionHandlerValue } from '../interface'
import PermissionHandlerDialog from './permission-dialog'

const PermissionHandler = () => {
  const { alert, toast, modal } = useDialogDispatchers()
  const [value, setValue] = useState<PermissionHandlerValue>()
  useEffect(() => {
    if (value) {
      modal({
        id: 'PermissionHandler',
        title: 'permissions',
        message: <PermissionHandlerDialog value={value}></PermissionHandlerDialog>,
        okFn: () => {},
        cancelFn: () => {},
        okLabel: 'sure',
        cancelLabel: 'no'
      })
    }
  }, [value])
  return (<></>)
}

export default PermissionHandler
