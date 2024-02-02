import React, {useEffect} from 'react'
import {useAppDispatch} from '../../redux/hooks'

const LogoPage: React.FC = () => {
  const dispatch = useAppDispatch()

  useEffect(() => {
    dispatch({type: 'remixide/connect'})
  }, [])

  return (
    <div>
      <div>
        <img className="w-100" src="https://remix.ethereum.org/assets/img/remixLogo.webp" />
      </div>
    </div>
  )
}

export default LogoPage
