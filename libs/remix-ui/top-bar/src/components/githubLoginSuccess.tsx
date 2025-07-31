import React from 'react'
import { GitHubUser } from '@remix-api'
import { CustomTopbarMenu } from '@remix-ui/helper'
import { Button, ButtonGroup, Dropdown } from 'react-bootstrap'

interface GithubLoginSuccessProps {
  user: GitHubUser
  handleLogout: () => void
  cloneGitRepository: () => void
  publishToGist: () => Promise<void>
  logOutOfGithub: () => void
}

const _paq = window._paq || []

export default function GithubLoginSuccess ({ user, handleLogout, cloneGitRepository, publishToGist, logOutOfGithub }: GithubLoginSuccessProps) {

  return (
    <Dropdown
      as={ButtonGroup}
      alignRight={true}
      className="d-flex flex-nowrap"
    >
      <Button
        className="btn btn-topbar btn-sm border d-flex flex-nowrap"
        data-id="github-dropdown-toggle-login"
        style={{ fontSize: '0.8rem' }}
      >
        {user.login}
        <img src={user.avatar_url} alt="Avatar" className="ml-1" style={{
          width: '25px',
          height: '25px',
          borderRadius: '50%',
          objectFit: 'cover',
        }}/>
      </Button>
      <Dropdown.Toggle
        as={Button}
        variant="outline-secondary"
        className="btn-topbar btn-sm"
        data-id="github-dropdown-toggle"
      >
      </Dropdown.Toggle>
      <Dropdown.Menu
        as={CustomTopbarMenu}
        className="custom-dropdown-items w-75 text-decoration-none"
      >
        <Dropdown.Item
          data-id="github-dropdown-item-clone"
          onClick={cloneGitRepository}
        >
          <i className="fab fa-github mr-2"></i>
          <span>Clone</span>
        </Dropdown.Item>
        <Dropdown.Item
          data-id="github-dropdown-item-publish-to-gist"
          onClick={async () => {
            await publishToGist()
            _paq.push(['trackEvent', 'topbar', 'GIT', 'publishToGist'])
          }}
        >
          <i className="fab fa-github mr-2"></i>
          <span>Publish to Gist</span>
        </Dropdown.Item>
        <Dropdown.Divider style={{ pointerEvents: 'none' }} className="border" />
        <Dropdown.Item
          data-id="github-dropdown-item-disconnect"
          onClick={() => {
            handleLogout()
            _paq.push(['trackEvent', 'topbar', 'GIT', 'logout'])
          }}
          className="text-danger"
        >
          <i className="fas fa-sign-out-alt mr-2"></i>
          <span>Disconnect</span>
        </Dropdown.Item>
      </Dropdown.Menu>
    </Dropdown>
  )
}
