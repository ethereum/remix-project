import axios from "axios"

export class GitHubAPI {
  private token: string

  constructor(token: string) {
    this.token = token
  }

  async getUser(): Promise<any> {
    const response = await axios.get('https://api.github.com/user', {
      headers: {
        'Authorization': `token ${this.token}`,
        'Accept': 'application/vnd.github.v3+json'
      }
    })
    return response.data
  }

  async getUserEmails(): Promise<any[]> {
    const response = await axios.get('https://api.github.com/user/emails', {
      headers: {
        'Authorization': `token ${this.token}`,
        'Accept': 'application/vnd.github.v3+json'
      }
    })
    return response.data
  }

  async getRepositories(): Promise<any[]> {
    const response = await axios.get('https://api.github.com/user/repos', {
      headers: {
        'Authorization': `token ${this.token}`,
        'Accept': 'application/vnd.github.v3+json'
      },
      params: {
        per_page: 100,
        sort: 'updated'
      }
    })
    return response.data
  }
}

export const TokenManager = {
  saveToken: (token: string) => {
    localStorage.setItem('github_token', token)
  },

  getToken: (): string | null => {
    return localStorage.getItem('github_token')
  },

  removeToken: () => {
    localStorage.removeItem('github_token')
  },

  isTokenValid: async (token: string): Promise<boolean> => {
    try {
      await axios.get('https://api.github.com/user', {
        headers: {
          'Authorization': `token ${token}`,
          'Accept': 'application/vnd.github.v3+json'
        }
      })
      return true
    } catch {
      return false
    }
  }
}
