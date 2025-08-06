import React, { useState, forwardRef, ReactNode } from 'react'
import { Dropdown, Tooltip, OverlayTrigger } from 'react-bootstrap'
import { useAppDispatch } from '../../redux/hooks'
import './index.css'

interface CustomToggleProps {
  children?: ReactNode;
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
}

const CustomToggle = forwardRef<HTMLButtonElement, CustomToggleProps>(
  ({ children, onClick }, ref) => (
    <button
      ref={ref}
      onClick={(e) => { e.preventDefault(); onClick?.(e); }}
      className="btn btn-secondary d-flex justify-content-between align-items-center w-100 custom-dropdown-toggle"
    >
      {children}
      <i className="fas fa-caret-down"></i>
    </button>
  )
);
CustomToggle.displayName = 'CustomToggle';

const CustomMenu = forwardRef<HTMLDivElement, { children?: ReactNode, className?: string }>(
  ({ children, className }, ref) => {
    return (
      <div
        ref={ref}
        className={className}
      >
        {children}
      </div>
    );
  }
);
CustomMenu.displayName = 'CustomMenu';

function RepoImporter({ list }: any): JSX.Element {
  const [open, setOpen] = useState(false)
  const [name, setName] = useState('')
  const [branch, setBranch] = useState('')
  const dispatch = useAppDispatch()

  const panelChange = () => { setOpen(!open) }
  const selectRepo = (repo: { name: string; branch: string }) => {
    dispatch({ type: 'workshop/loadRepo', payload: repo });
    (window as any)._paq.push(['trackEvent', 'learneth', 'select_repo', `${repo.name}/${repo.branch}`])
  }
  const importRepo = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    dispatch({ type: 'workshop/loadRepo', payload: { name, branch } });   
    (window as any)._paq.push(['trackEvent', 'learneth', 'import_repo', `${name}/${branch}`])
  } 

  return (
    <div className="px-3 pt-3">
      <button onClick={panelChange} className="btn btn-secondary d-flex align-items-center justify-content-center w-100 mb-3">
        <i className="fas fa-upload mr-2"></i>
        <span>Import another tutorial repo</span>
      </button>

      {open && (
        <>
          <h6 className="mb-3">Tutorial import</h6>
          <div className="bg-light border rounded p-3">
            <Dropdown className="w-100 mb-2">
              <Dropdown.Toggle as={CustomToggle} id="dropdown-custom-components">
                Select a repo
              </Dropdown.Toggle>  
              <Dropdown.Menu as={CustomMenu} className="w-100 custom-dark-menu"> 
                {list.map((item: any) => (
                  <Dropdown.Item
                    key={`${item.name}/${item.branch}`}
                    onClick={() => selectRepo(item)}
                    title={`${item.name}-${item.branch}`}
                  >
                    <div className="text-truncate">
                      {item.name}-{item.branch}
                    </div>
                  </Dropdown.Item>
                ))}
              </Dropdown.Menu>
            </Dropdown>

            <div className="d-flex align-items-center my-3">
              <hr className="w-100 hr-themed" />
              <span className="px-2 small text-nowrap">or import</span>
              <hr className="w-100 hr-themed" />
            </div>

            <form onSubmit={importRepo}>
              <div className="form-group">
                <label className="repo-label d-flex align-items-center" htmlFor="name">
                  REPO REFERENCE
                  <OverlayTrigger placement="right" overlay={<Tooltip id="tooltip-repo">ie. username/repository</Tooltip>}>
                    <i className="fas fa-question-circle ml-1" />
                  </OverlayTrigger>
                </label>
                <input
                  id="name"
                  type="text"
                  className="form-control"
                  required
                  placeholder="username/repository"
                  onChange={(e) => setName(e.target.value)}
                  value={name}
                />
              </div>

              <div className="form-group">
                <label className="repo-label" htmlFor="branch">BRANCH</label>
                <input
                  id="branch"
                  type="text"
                  className="form-control"
                  required
                  placeholder="master" 
                  onChange={(e) => setBranch(e.target.value)}
                  value={branch}
                />  
              </div>
              
              <button className="btn btn-primary w-100" type="submit" disabled={!name || !branch}>
                Import tutorial repository
              </button> 
            </form> 
          </div>   
        </> 
      )} 
    </div>
  )  
} 

export default RepoImporter 