/* eslint-disable @nrwl/nx/enforce-module-boundaries */
import React, { useEffect, useRef, useState, useCallback } from 'react'
import axios from 'axios'
import { Button, ButtonGroup, Dropdown } from 'react-bootstrap'
import { CustomTopbarMenu } from '@remix-ui/helper'
import { publishToGist } from 'libs/remix-ui/workspace/src/lib/actions'

const _paq = window._paq || []

interface GitHubUser {
  login: string;
  avatar_url?: string;
  html_url?: string;
  isConnected: boolean;
}

interface GitHubLoginProps {
  onLoginSuccess: (user: GitHubUser, token: string) => void
  onLoginError: (error: string) => void
  clientIdEndpoint?: string
  tokenExchangeEndpoint?: string
  cloneGitRepository: () => void
  logOutOfGithub: () => void
}

export const GitHubLogin: React.FC<GitHubLoginProps> = ({
  onLoginSuccess,
  onLoginError,
  cloneGitRepository,
  logOutOfGithub,
  clientIdEndpoint = 'https://github-login-proxy.api.remix.live/client',
  tokenExchangeEndpoint = 'https://github-login-proxy.api.remix.live/login/oauth/access_token'
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [popupError, setPopupError] = useState(false);
  const popupRef = useRef<Window | null>(null);

  // Get GitHub OAuth client ID based on hostname
  const getClientId = async (): Promise<string> => {
    try {
      const host = window.location.hostname;
      const response = await axios.get(`${clientIdEndpoint}/${host}`, {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      });
      return response.data.client_id;
    } catch (error) {
      throw new Error('Failed to fetch GitHub client ID');
    }
  };

  // Handle popup-based OAuth login
  const openPopupLogin = useCallback(async () => {
    setIsLoading(true);
    setPopupError(false);

    try {
      const clientId = await getClientId();
      const redirectUri = `${window.location.origin}/?source=github`
      const scope = 'repo gist user:email read:user';

      const url = `https://github.com/login/oauth/authorize?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${encodeURIComponent(scope)}&response_type=code`;

      const popup = window.open(url, '_blank', 'width=600,height=700');
      if (!popup) {
        throw new Error('Popup blocked or failed to open');
      }
      popupRef.current = popup;

      // Listen for messages from the popup
      const messageListener = async (event: MessageEvent) => {
        if (event.origin !== window.location.origin) return;

        if (event.data.type === 'GITHUB_AUTH_SUCCESS') {
          const token = event.data.token;
          await handleLoginSuccess(token);
          window.removeEventListener('message', messageListener);
          popup?.close();
        } else if (event.data.type === 'GITHUB_AUTH_FAILURE') {
          setPopupError(true);
          setIsLoading(false);
          onLoginError(event.data.error);
          window.removeEventListener('message', messageListener);
          popup?.close();
        }
      };

      window.addEventListener('message', messageListener);
    } catch (error) {
      setIsLoading(false);
      setPopupError(true);
      onLoginError(error instanceof Error ? error.message : 'Login failed');
    }
  }, [onLoginSuccess, onLoginError, clientIdEndpoint]);

  // Handle successful login
  const handleLoginSuccess = async (token: string) => {
    try {
      // Load GitHub user data
      const userData = await loadGitHubUser(token);

      // Save token to localStorage
      localStorage.setItem('github_token', token);

      setIsLoading(false);
      onLoginSuccess(userData, token);
    } catch (error) {
      setIsLoading(false);
      onLoginError('Failed to load user data');
    }
  };

  // Load GitHub user data from token
  const loadGitHubUser = async (token: string): Promise<GitHubUser> => {
    const response = await axios.get('https://api.github.com/user', {
      headers: {
        'Authorization': `token ${token}`,
        'Accept': 'application/vnd.github.v3+json'
      }
    });

    return {
      login: response.data.login,
      avatar_url: response.data.avatar_url,
      html_url: response.data.html_url,
      isConnected: true
    };
  };

  // Check if user is already logged in
  useEffect(() => {
    const token = localStorage.getItem('github_token');
    if (token) {
      handleLoginSuccess(token);
    }
  }, []);

  return (
    <Dropdown
      as={ButtonGroup}
      alignRight={true}
    >
      <Button
        className="btn btn-topbar btn-sm border d-flex flex-nowrap"
        data-id="github-dropdown-toggle-login"
        style={{ fontSize: '0.8rem' }}
        onClick={openPopupLogin}
        disabled={isLoading}
      >
        {isLoading ? (
          <>
            <i className="fas fa-spinner fa-spin mr-1"></i>
            Connecting...
          </>
        ) : (
          <>
            <i className="fab fa-github mr-1"></i>
            Login with GitHub
          </>
        )}
      </Button>

      <Dropdown.Toggle
        as={Button}
        variant="outline-secondary"
        className="btn-topbar btn-sm"
        data-id="github-dropdown-toggle"
        // disabled={true}
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
          onClick={async () => {
            await logOutOfGithub()
            _paq.push(['trackEvent', 'topbar', 'GIT', 'logout'])
          }}
          className="text-danger"
        >
          <i className="fas fa-sign-out-alt mr-2"></i>
          <span>Disconnect</span>
        </Dropdown.Item>
      </Dropdown.Menu>
    </Dropdown>
  );
};
