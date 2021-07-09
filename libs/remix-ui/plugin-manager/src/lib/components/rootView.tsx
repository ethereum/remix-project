import React, { FormEvent, Fragment, useContext, useState } from 'react'
import { PluginManagerContext } from '../contexts/pluginmanagercontext'
import ModuleHeading from './moduleHeading'
import PluginCard from './pluginCard'
import { ModalDialog } from '@remix-ui/modal-dialog'
import LocalPluginForm from './localPluginForm'
import { FormStateProps } from '../../types'

interface RootViewProps {
  localPluginButtonText: string
}

function RootView ({ localPluginButtonText }: RootViewProps) {
  const { actives, inactives } = useContext(PluginManagerContext)
  const [visible, setVisible] = useState<boolean>(true)

  const openModal = () => {
    setVisible(false)
  }

  const closeModal = () => setVisible(true)

  const handleSubmit = (evt: FormEvent, formData: FormStateProps) => {
    console.log('Data submitted from the form!!!: ', formData)
    evt.preventDefault()
    closeModal()
  }

  return (
    <Fragment>
      <ModalDialog
        handleHide={closeModal}
        hide={visible}
        title="Local Plugin"
        okLabel="OK"
        cancelLabel="Cancel"
        cancelFn={closeModal}
      >
        <LocalPluginForm
          formSubmitHandler={handleSubmit}
        />
      </ModalDialog>

      <div id="pluginManager" data-id="pluginManagerComponentPluginManager">
        <header className="form-group remixui_pluginSearch plugins-header py-3 px-4 border-bottom" data-id="pluginManagerComponentPluginManagerHeader">
          <input type="text" className="form-control" placeholder="Search" data-id="pluginManagerComponentSearchInput" />
          <button onClick={openModal} className="remixui_pluginSearchButton btn bg-transparent text-dark border-0 mt-2 text-underline" data-id="pluginManagerComponentPluginSearchButton">
          Connect to a Local Plugin
          </button>
        </header>
        <section data-id="pluginManagerComponentPluginManagerSection">
          {actives.length === 0 ? (
            <Fragment>
              <ModuleHeading headingLabel="Active Modules"/>
              {actives.map((profile) => (
                <PluginCard profile={profile}/>
              ))}
            </Fragment>
          ) : null }
          {inactives.length === 0 ? (
            <Fragment>
              <ModuleHeading headingLabel="Inactive Modules"/>
              {inactives.map((profile) => (
                <PluginCard profile={profile}/>
              ))}
            </Fragment>
          ) : null}
        </section>
      </div>
    </Fragment>
  )
}

export default RootView
