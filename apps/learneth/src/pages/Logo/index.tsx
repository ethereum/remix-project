import React, {useEffect} from 'react'
// import remixClient from '../../remix-client';
import {useAppDispatch} from '../../redux/hooks'
import logo from '../../assets/logo-background.svg'
import './index.css'

const LogoPage: React.FC = () => {
  const dispatch = useAppDispatch()

  useEffect(() => {
    dispatch({type: 'remixide/connect'})
    // remixClient.on('theme', 'themeChanged', (theme: any) => {
    //   dispatch({ type: 'remixide/save', payload: { theme: theme.quality } });
    // });
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
