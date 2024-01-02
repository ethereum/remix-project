// This script can be used to open a PR for base branch 'remix_beta' using an existing pull request
// Pull request number should be provided while running this script
// It will use the reference branch same as the shared PR
// To create a new PR, Github auth token with scope 'repo' needs to be provided
// Command to run this script: fromPR=4369 authToken=abc123 yarn run createPRToBeta

import { Octokit } from "octokit"

async function createPR (prNumber, baseBranch) {
  try {
    if (!prNumber) throw new Error(`Please provide a PR number with 'fromPR' env variable`)

    const octokit = new Octokit({
      auth: process.env.authToken || ''
    })

    const owner = 'ethereum'
    const repo = 'remix-project'
    
    const prData = await octokit.request('GET /repos/{owner}/{repo}/pulls/{pull_number}', {
        owner: owner,
        repo: repo,
        pull_number: prNumber,
        headers: {
          'X-GitHub-Api-Version': '2022-11-28'
        }
      })

    const response = await octokit.request('POST /repos/{owner}/{repo}/pulls', {
      owner: owner,
      repo: repo,
      title: prData.data.title + ' (for beta)',
      body: prData.data.body + ' (for beta)',
      head: prData.data.head.ref,
      base: baseBranch,
      headers: {
        'X-GitHub-Api-Version': '2022-11-28'
      }
    })
    
    console.log('Pull Request Created!!! See: ', response.data.html_url)

  } catch (error) {
    console.error('Error during PR creation: ', error.message)
  }
}

createPR(process.env.fromPR, 'remix_beta')
