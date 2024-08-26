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
      <CustomTooltip
        placement="right"
        tooltipText={intl.formatMessage({ id: 'quickDapp.uploadLogoTooltip' })}
      >
        <label htmlFor="upload-button" className="cursor_pointer d-flex justify-content-center align-items-center position-relative" style={{ height: 170 }}>
          {logo ? (
            <img src={preview} alt="preview" style={{ width: 120, height: 120 }} />
          ) : (
            <i className="fas fa-upload" style={{ fontSize: 120 }}></i>
          )}
        </label>
      </CustomTooltip>
    </div>
  )
}

export default ImageUpload
