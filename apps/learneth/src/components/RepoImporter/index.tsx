import React, {useState, useEffect} from 'react'
import {Button, Dropdown, Form, Tooltip, OverlayTrigger} from 'react-bootstrap'
import {useAppDispatch} from '../../redux/hooks'
import './index.css'

function RepoImporter({list, selectedRepo}: any): JSX.Element {
  const [open, setOpen] = useState(false)
  const [name, setName] = useState('')
  const [branch, setBranch] = useState('')
  const dispatch = useAppDispatch()

  useEffect(() => {
    setName(selectedRepo.name)
    setBranch(selectedRepo.branch)
  }, [selectedRepo])

  const panelChange = () => {
    setOpen(!open)
  }

  const selectRepo = (repo: {name: string; branch: string}) => {
    dispatch({type: 'workshop/loadRepo', payload: repo});
    (window as any)._paq.push(['trackEvent', 'learneth', 'select_repo', `${name}/${branch}`])
  }

  const importRepo = (event: {preventDefault: () => void}) => {
    event.preventDefault()
    dispatch({type: 'workshop/loadRepo', payload: {name, branch}});
    (window as any)._paq.push(['trackEvent', 'learneth', 'import_repo', `${name}/${branch}`])
  }

  const resetAll = () => {
    dispatch({type: 'workshop/resetAll'})
    setName('')
    setBranch('')
  }

  return (
    <>
      {selectedRepo.name && (
        <div className="container-fluid mb-3 small mt-3">
          Tutorials from:
          <h4 className="mb-1">{selectedRepo.name}</h4>
          <span className="">Date modified: {new Date(selectedRepo.datemodified).toLocaleString()}</span>
        </div>
      )}

      <div onClick={panelChange} style={{cursor: 'pointer'}} className="container-fluid d-flex mb-3 small">
        <div className="d-flex pr-2 pl-2">
          <i className={`arrow-icon pt-1 fas fa-xs ${open ? 'fa-chevron-down' : 'fa-chevron-right'}`}></i>
        </div>
        <div className="d-flex">Import another tutorial repo</div>
      </div>

      {open && (
        <div className="container-fluid">
          <Dropdown className="w-100">
            <Dropdown.Toggle className="btn btn-secondary w-100" id="dropdownBasic1">
              Select a repo
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
            reset list
          </div>
        </div>
      )}

      <div className="container-fluid mt-3">
        {open && (
          <Form onSubmit={importRepo}>
            <Form.Group className="form-group">
              <Form.Label className="mr-2" htmlFor="name">
                REPO
              </Form.Label>
              <OverlayTrigger placement="right" overlay={<Tooltip id="tooltip-right">ie username/repository</Tooltip>}>
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
              <Form.Label htmlFor="branch">BRANCH</Form.Label>
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
              Import {name}
            </Button>
            <a href="https://github.com/bunsenstraat/remix-learneth-plugin/blob/master/README.md" className="d-none" target="_blank" rel="noreferrer">
              <i className="fas fa-info" /> How to setup your repo
            </a>
          </Form>
        )}
        <hr />
      </div>
    </>
  )
}

export default RepoImporter
