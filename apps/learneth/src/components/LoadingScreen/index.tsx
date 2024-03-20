import React, {useContext} from 'react'
import BounceLoader from 'react-spinners/BounceLoader'
import {AppContext} from '../../contexts'
import './index.css'

const LoadingScreen: React.FC = () => {
  const {appState} = useContext(AppContext)
  const loading = appState.loading.screen

  return loading ? (
    <div className="spinnersOverlay">
      <BounceLoader color="#a7b0ae" size={100} className="spinnersLoading" />
    </div>
  ) : null
}

export default LoadingScreen
