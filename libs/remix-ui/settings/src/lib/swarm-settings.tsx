import React, { useEffect, useState } from 'react'
import { useIntl } from 'react-intl'

export function SwarmSettings() {
  const intl = useIntl()

  return (
    <>
      <div className="text-secondary my-2">
        <input
          id="swarmprivatebeeaddress"
          data-id="settingsPrivateBeeAddress"
          className="form-control"
          placeholder={intl.formatMessage({ id: 'settings.privateBeeAddress' })}
          // onChange={handleSavePrivateBeeAddress}
          // value={privateBeeAddress}
        />
      </div>
      <div className="text-secondary mt-2 mb-0">
        <input
          id="swarmpostagestamp"
          data-id="settingsPostageStampId"
          className="form-control"
          placeholder={intl.formatMessage({ id: 'settings.postageStampID' })}
          // onChange={handleSavePostageStampId}
          // value={postageStampId}
        />
      </div>
      <div className="d-flex pt-3">
        <input
          className="btn btn-sm btn-primary"
          id="saveswarmsettings"
          data-id="settingsTabSaveSwarmSettings"
          // onClick={() => saveSwarmSettings()}
          value={intl.formatMessage({ id: 'settings.save' })}
          type="button"
          // disabled={privateBeeAddress === ''}
        ></input>
      </div>
    </>
  )
}
