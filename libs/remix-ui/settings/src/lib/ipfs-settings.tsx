import React, { useEffect, useState } from 'react'
import { useIntl } from 'react-intl'

export function IPFSSettings() {
  const intl = useIntl()

  return (
    <>
      <div className="text-secondary my-2">
        <input
          placeholder={intl.formatMessage({ id: 'settings.host' })}
          id="settingsIpfsUrl"
          data-id="settingsIpfsUrl"
          className="form-control"
          // onChange={handleSaveIpfsUrl}
          // value={ipfsUrl}
        />
      </div>
      <div className="text-secondary my-2">
        <input
          placeholder={intl.formatMessage({ id: 'settings.protocol' })}
          id="settingsIpfsProtocol"
          data-id="settingsIpfsProtocol"
          className="form-control"
          // onChange={handleSaveIpfsProtocol}
          // value={ipfsProtocol}
        />
      </div>
      <div className="text-secondary my-2">
        <input
          placeholder={intl.formatMessage({ id: 'settings.port' })}
          id="settingsIpfsPort"
          data-id="settingsIpfsPort"
          className="form-control"
          // onChange={handleSaveIpfsPort}
          // value={ipfsPort}
        />
      </div>
      <div className="text-secondary my-2">
        <input
          id="settingsIpfsProjectId"
          data-id="settingsIpfsProjectId"
          className="form-control"
          placeholder={intl.formatMessage({ id: 'settings.projectID' }) + ' (INFURA)'}
          // onChange={handleSaveIpfsProjectId}
          // value={ipfsProjectId}
        />
      </div>
      <div className="text-secondary mt-2 mb-0">
        <input
          id="settingsIpfsProjectSecret"
          data-id="settingsIpfsProjectSecret"
          className="form-control"
          placeholder={intl.formatMessage({ id: 'settings.projectSecret' }) + ' (INFURA)'}
          type="password"
          // onChange={handleSaveIpfsSecret}
          // value={ipfsProjectSecret}
        />
        <div className="d-flex pt-3">
          <input
            className="btn btn-sm btn-primary"
            id="saveIpfssettings"
            data-id="settingsTabSaveIpfsSettings"
            // onClick={() => saveIpfsSettings()}
            value={intl.formatMessage({ id: 'settings.save' })}
            type="button"
          ></input>
        </div>
      </div>
    </>
  )
}
