import React, { useContext, useEffect, useState } from 'react'
import { useIntl } from 'react-intl';
import { CustomTooltip } from '@remix-ui/helper';
import { AppContext } from '../../contexts'

const ImageUpload = () => {
  const intl = useIntl()
  const { appState, dispatch } = useContext(AppContext)
  const { logo } = appState.instance
  const [preview, setPreview] = useState(null)

  useEffect(() => {
    if (logo) {
      const base64data = btoa(new Uint8Array(logo).reduce((data, byte) => data + String.fromCharCode(byte), ''))
      setPreview('data:image/jpeg;base64,' + base64data)
    } else {
      setPreview(null)
    }
  }, [logo])

  const handleImageChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const reader: any = new FileReader()
      reader.onloadend = () => {
        dispatch({ type: 'SET_INSTANCE', payload: { logo: reader.result } })
      }
      reader.readAsArrayBuffer(e.target.files[0])
    }
  }

  return (
    <div className="col-3 pr-0">
      <input data-id="uploadLogo" className="d-none" type="file" accept="image/*" onChange={handleImageChange} id="upload-button" />
      <label htmlFor="upload-button" className="cursor_pointer d-flex justify-content-center align-items-center position-relative" style={{ height: 170 }}>
        {logo ? (
          <>
            <CustomTooltip
              placement="right"
              tooltipText={intl.formatMessage({ id: 'quickDapp.updateLogoTooltip' })}
            >
              <img src={preview} alt="preview" style={{ width: 120, height: 120 }} />
            </CustomTooltip>
            <CustomTooltip
              placement="right"
              tooltipText={intl.formatMessage({ id: 'quickDapp.deleteLogoTooltip' })}
            >
              <button
                className="d-flex justify-content-center align-items-center position-absolute border-0 rounded-circle"
                style={{
                  top: 5,
                  right: 5,
                  width: 20,
                  height: 20,
                  backgroundColor: 'var(--gray-dark)'
                }}
                onClick={(event) => {
                  event.preventDefault()
                  dispatch({ type: 'SET_INSTANCE', payload: { logo: '' } })
                }}
              >
                <i className="fas fa-times" style={{
                  color: 'var(--text-bg-mark)',
                  fontSize: 'large'
                }}></i>
              </button>
            </CustomTooltip>
          </>
        ) : (
          <CustomTooltip
            placement="right"
            tooltipText={intl.formatMessage({ id: 'quickDapp.addLogoTooltip' })}
          >
            <i className="fas fa-upload" style={{ fontSize: 120 }}></i>
          </CustomTooltip>
        )}
      </label>
    </div>
  )
}

export default ImageUpload
