/* eslint-disable @nrwl/nx/enforce-module-boundaries */
import React, { useContext, useState, useCallback, useEffect } from 'react'
import { Button, ButtonGroup, Dropdown } from 'react-bootstrap'
import { CustomTopbarMenu } from '@remix-ui/helper'
import { publishToGist } from 'libs/remix-ui/workspace/src/lib/actions'
import { AppContext } from '@remix-ui/app'

const _paq = window._paq || []

interface GitHubLoginProps {
  cloneGitRepository: () => void
  logOutOfGithub: () => void
}

export const GitHubLogin: React.FC<GitHubLoginProps> = ({
  cloneGitRepository,
  logOutOfGithub
}) => {
  const appContext = useContext(AppContext)
  const [isLoading, setIsLoading] = useState(false)

  // Get the GitHub user state from app context
  const gitHubUser = appContext?.appState?.gitHubUser
  const isConnected = gitHubUser?.isConnected

  // Simple login handler that delegates to the app context
  const handleLogin = useCallback(async () => {
    if (isLoading) return

    setIsLoading(true)

    try {
      await appContext.loginWithGitHub()
    } catch (error) {
      console.error('Failed to start GitHub login:', error)
    } finally {
      setIsLoading(false)
    }
  }, [appContext, isLoading])

  // Monitor GitHub user state changes to stop loading when connection is established
  useEffect(() => {
    if (isConnected && isLoading) {
      setIsLoading(false)
    }
  }, [isConnected, isLoading])

  return (
    <Dropdown
      as={ButtonGroup}
      align="end"
    >
      <Button
        className="btn btn-topbar btn-sm border d-flex flex-nowrap align-items-center justify-content-between"
        data-id="github-dropdown-toggle-login"
        style={{
          fontSize: '0.8rem',
          padding: '0.35rem 0.5rem',
        }}
        onClick={isConnected ? undefined : handleLogin}
        disabled={isLoading || isConnected}
      >
        {isLoading ? (
          <>
            <i className="fas fa-spinner fa-spin me-1"></i>
            <span>Opening...</span>
          </>
        ) : isConnected ? (
          <div className="d-flex flex-nowrap align-items-center flex-row justify-content-center">
            <i className="fab fa-github me-1"></i>
            <span>{gitHubUser.login}</span>
          </div>
        ) : (
          <div className="d-flex flex-nowrap align-items-center flex-row justify-content-center">
            <i className="fab fa-github me-1"></i>
            <span>Login with GitHub</span>
          </div>
        )}
      </Button>

      <Dropdown.Toggle
        as={Button}
        variant="outline-secondary"
        className="btn-topbar btn-sm"
        data-id="github-dropdown-toggle"
        disabled={!isConnected}
      >
      </Dropdown.Toggle>
      <Dropdown.Menu
        as={CustomTopbarMenu}
        className="custom-dropdown-items w-75 text-decoration-none bg-light"
      >
        <Dropdown.Item
          data-id="github-dropdown-item-clone"
          onClick={cloneGitRepository}
        >
          <i className="fab fa-github me-2"></i>
          <span>Clone</span>
        </Dropdown.Item>
        <Dropdown.Item
          data-id="github-dropdown-item-publish-to-gist"
          onClick={async () => {
            await publishToGist()
            _paq.push(['trackEvent', 'topbar', 'GIT', 'publishToGist'])
          }}
        >
          <i className="fab fa-github me-2"></i>
          <span>Publish to Gist</span>
        </Dropdown.Item>
        <Dropdown.Divider style={{ pointerEvents: 'none' }} className="border" />
        <Dropdown.Item
          data-id="github-dropdown-item-disconnect"
          onClick={async () => {
            await logOutOfGithub()
            _paq.push(['trackEvent', 'topbar', 'GIT', 'logout'])
          }}
          className="text-danger"
        >
          <i className="fas fa-sign-out-alt me-2"></i>
          <span>Disconnect</span>
        </Dropdown.Item>
      </Dropdown.Menu>
    </Dropdown>
  );
};
