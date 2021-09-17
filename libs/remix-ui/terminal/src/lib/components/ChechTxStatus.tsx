import React from 'react' // eslint-disable-line

const CheckTxStatus = ({ tx, type }) => {
  if (tx.status === '0x1' || tx.status === true) {
    return (<i className='txStatus succeeded fas fa-check-circle'></i>)
  }
  if (type === 'call' || type === 'unknownCall' || type === 'unknown') {
    return (<i className='txStatus call'>call</i>)
  } else if (tx.status === '0x0' || tx.status === false) {
    return (<i className='txStatus failed fas fa-times-circle'></i>)
  } else {
    return (<i className='txStatus notavailable fas fa-circle-thin' title='Status not available' ></i>)
  }
}

export default CheckTxStatus
