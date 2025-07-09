export const HOME_TAB_BASE_URL = process.env.CIRCLE_BRANCH === 'beta' ?
  'https://raw.githubusercontent.com/remix-project-org/remix-dynamics/refs/heads/beta/' : process.env.CIRCLE_BRANCH === 'live' ?
    'https://raw.githubusercontent.com/remix-project-org/remix-dynamics/refs/heads/live/' :
    'https://raw.githubusercontent.com/remix-project-org/remix-dynamics/refs/heads/alpha/'

export const HOME_TAB_NEW_UPDATES = HOME_TAB_BASE_URL + 'hometab/new-updates.json'
export const HOME_TAB_PLUGIN_LIST = HOME_TAB_BASE_URL + 'hometab/plugin-list.json'