import React, {useEffect} from 'react'
import {useAppDispatch} from '../../redux/hooks'
import logo from '../../assets/logo-background.svg'
import './index.css'

const LogoPage: React.FC = () => {
  const dispatch = useAppDispatch()

  useEffect(() => {
    dispatch({type: 'remixide/connect'})
  }, [])

  return (
    <div>
      <div className="remixLogo">
        <img src={logo} />
      </div>
    </div>
  )
}

export default LogoPage
