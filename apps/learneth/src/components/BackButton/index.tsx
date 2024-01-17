import React, {useState} from 'react'
import {Link, useLocation, useNavigate} from 'react-router-dom'
import {Button, Modal, Tooltip, OverlayTrigger} from 'react-bootstrap'
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome'
import {faHome, faBars, faChevronLeft, faChevronRight} from '@fortawesome/free-solid-svg-icons'
// import {useAppSelector} from '../../redux/hooks'
import './index.scss'

function BackButton({entity}: any) {
  const navigate = useNavigate()
  const location = useLocation()
  const [show, setShow] = useState(false)
  // const theme = useAppSelector((state) => state.remixide.theme)
  const isDetailPage = location.pathname === '/detail'
  const queryParams = new URLSearchParams(location.search)
  const stepId = Number(queryParams.get('stepId'))

  return (
    <nav className="navbar navbar-light bg-light justify-content-between pt-1 pb-1 pl-1">
      <ul className="nav mr-auto">
        <li className="nav-item">
          <div
            className="btn back"
            onClick={() => {
              setShow(true)
            }}
            role="button"
          >
            <OverlayTrigger placement="right" overlay={<Tooltip id="tooltip-right">Leave tutorial</Tooltip>}>
              <FontAwesomeIcon className="pl-1" icon={faHome} />
            </OverlayTrigger>
          </div>
        </li>
        {isDetailPage && (
          <li className="nav-item">
            <Link className="btn" to={`/list?id=${entity.id}`} title="Tutorial menu">
              <FontAwesomeIcon icon={faBars} />
            </Link>
          </li>
        )}
      </ul>
      {isDetailPage && (
        <form className="form-inline">
          {stepId > 0 && (
            <Link to={`/detail?id=${entity.id}&stepId=${stepId - 1}`}>
              <FontAwesomeIcon className="pr-1" icon={faChevronLeft} />
            </Link>
          )}
          {stepId + 1}/{entity && <div className="">{entity.steps.length}</div>}
          {stepId < entity.steps.length - 1 && (
            <Link to={`/detail?id=${entity.id}&stepId=${stepId + 1}`}>
              <FontAwesomeIcon className="pl-1" icon={faChevronRight} />
            </Link>
          )}
        </form>
      )}
      <Modal
        // data-bs-theme={theme}
        show={show}
        onHide={() => {
          setShow(false)
        }}
      >
        <Modal.Header placeholder={''} closeButton>
          <Modal.Title>Leave tutorial</Modal.Title>
        </Modal.Header>
        <Modal.Body>Are you sure you want to leave the tutorial?</Modal.Body>
        <Modal.Footer>
          <Button
            variant="secondary"
            onClick={() => {
              setShow(false)
            }}
          >
            No
          </Button>
          <Button
            variant="success"
            onClick={() => {
              setShow(false)
              navigate('/home')
            }}
          >
            Yes
          </Button>
        </Modal.Footer>
      </Modal>
    </nav>
  )
}

export default BackButton
