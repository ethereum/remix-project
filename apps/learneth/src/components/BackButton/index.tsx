import React, {useState} from 'react'
import {Link, useLocation, useNavigate} from 'react-router-dom'
import {Button, Modal, Tooltip, OverlayTrigger} from 'react-bootstrap'
import './index.scss'

function BackButton({entity}: any) {
  const navigate = useNavigate()
  const location = useLocation()
  const [show, setShow] = useState(false)
  const isDetailPage = location.pathname === '/detail'
  const queryParams = new URLSearchParams(location.search)
  const stepId = Number(queryParams.get('stepId'))
  const nextStep = entity && entity.steps[stepId + 1]
  const previousStep = entity && entity.steps[stepId - 1]

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
              <i className="fas fa-home pl-1" />
            </OverlayTrigger>
          </div>
        </li>
        {isDetailPage && (
          <li className="nav-item">
            <OverlayTrigger placement="right" overlay={<Tooltip id="tooltip-rightTutorialMenu">Tutorial menu</Tooltip>}>
              <Link className="btn" to={`/list?id=${entity.id}`} onClick={() => (window as any)._paq.push(['trackEvent', 'learneth', 'back_to_menu_step', entity && entity.name])}>
                <i className="fas fa-bars" />
              </Link>
            </OverlayTrigger>
          </li>
        )}
      </ul>
      {isDetailPage && (
        <form className="form-inline">
          {stepId > 0 && (
            <Link to={`/detail?id=${entity.id}&stepId=${stepId - 1}`} onClick={() => (window as any)._paq.push(['trackEvent', 'learneth', 'previous_step', `${entity.name}/${previousStep && previousStep.name}`])}>
              <i className="fas fa-chevron-left pr-1" />
            </Link>
          )}
          {stepId + 1}/{entity && <div className="">{entity.steps.length}</div>}
          {stepId < entity.steps.length - 1 && (
            <Link to={`/detail?id=${entity.id}&stepId=${stepId + 1}`} onClick={() => (window as any)._paq.push(['trackEvent', 'learneth', 'next_step', `${entity.name}/${nextStep && nextStep.name}`])} >
              <i className="fas fa-chevron-right pl-1" />
            </Link>
          )}
        </form>
      )}
      <Modal
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
              navigate('/home');
              (window as any)._paq.push(['trackEvent', 'learneth', 'leave_tutorial', entity && entity.name])
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
