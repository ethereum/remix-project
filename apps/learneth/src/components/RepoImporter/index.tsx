import React, {useState, useEffect} from 'react'
import {Button, Dropdown, Form, Tooltip, OverlayTrigger} from 'react-bootstrap'
import {FormattedMessage} from 'react-intl'
import {loadRepo, resetAllWorkshop} from '../../actions'

function RepoImporter({list, selectedRepo}: any): JSX.Element {
  const [open, setOpen] = useState(false)
  const [name, setName] = useState('')
  const [branch, setBranch] = useState('')

  useEffect(() => {
    setName(selectedRepo.name)
    setBranch(selectedRepo.branch)
  }, [selectedRepo])

  const panelChange = () => {
    setOpen(!open)
  }

  const selectRepo = (repo: {name: string; branch: string}) => {
    loadRepo(repo)
  }

  const importRepo = (event: {preventDefault: () => void}) => {
    event.preventDefault()
    loadRepo({name, branch})
  }

  const resetAll = () => {
    resetAllWorkshop()
    setName('')
    setBranch('')
  }

  return (
    <>
      {selectedRepo.name && (
        <div className="container-fluid mb-3 small mt-3">
          <FormattedMessage id="learneth.tutorialsFrom" />: <h4 className="mb-1">{selectedRepo.name}</h4>
          <span className="">
            <FormattedMessage id="learneth.dateModified" />: {new Date(selectedRepo.datemodified).toLocaleString()}
          </span>
        </div>
      )}

      <div onClick={panelChange} style={{cursor: 'pointer'}} className="container-fluid d-flex mb-3 small">
        <div className="d-flex pr-2 pl-2">
          <i style={{width: 3}} className={`d-inline-block pt-1 fas fa-xs ${open ? 'fa-chevron-down' : 'fa-chevron-right'}`}></i>
        </div>
        <div className="d-flex">
          <FormattedMessage id="learneth.importAnotherRepo" />
        </div>
      </div>

      {open && (
        <div className="container-fluid">
          <Dropdown className="w-100">
            <Dropdown.Toggle className="btn btn-secondary w-100" id="dropdownBasic1">
              <FormattedMessage id="learneth.selectARepo" />
            </Dropdown.Toggle>
            <Dropdown.Menu className="w-100">
              {list.map((item: any) => (
                <Dropdown.Item
                  key={`${item.name}/${item.branch}`}
                  onClick={() => {
                    selectRepo(item)
                  }}
                >
                  {item.name}-{item.branch}
                </Dropdown.Item>
              ))}
            </Dropdown.Menu>
          </Dropdown>
          <div onClick={resetAll} className="small mb-3" style={{cursor: 'pointer'}}>
            <FormattedMessage id="learneth.resetList" />
          </div>
        </div>
      )}

      <div className="container-fluid mt-3">
        {open && (
          <Form onSubmit={importRepo}>
            <Form.Group className="form-group">
              <Form.Label className="mr-2" htmlFor="name">
                <FormattedMessage id="learneth.repo" />
              </Form.Label>
              <OverlayTrigger
                placement="right"
                overlay={
                  <Tooltip id="tooltip-right">
                    <FormattedMessage id="learneth.userAndRepo" />
                  </Tooltip>
                }
              >
                <i className="fas fa-question-circle" />
              </OverlayTrigger>
              <Form.Control
                id="name"
                required
                onChange={(e) => {
                  setName(e.target.value)
                }}
                value={name}
              />
              <Form.Label htmlFor="branch">
                <FormattedMessage id="learneth.branch" />
              </Form.Label>
              <Form.Control
                id="branch"
                required
                onChange={(e) => {
                  setBranch(e.target.value)
                }}
                value={branch}
              />
            </Form.Group>
            <Button className="btn btn-success start w-100" type="submit" disabled={!name || !branch}>
              <FormattedMessage id="learneth.import" /> {name}
            </Button>
            <a href="https://github.com/bunsenstraat/remix-learneth-plugin/blob/master/README.md" className="d-none" target="_blank" rel="noreferrer">
              <i className="fas fa-info-circle" /> <FormattedMessage id="learneth.howToSetupRepo" />
            </a>
          </Form>
        )}
        <hr />
      </div>
    </>
  )
}

export default RepoImporter
