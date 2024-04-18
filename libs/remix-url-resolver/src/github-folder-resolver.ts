// eslint-disable-next-line no-unused-vars
import axios, { AxiosResponse } from 'axios'

export const githubFolderResolver = async (url, obj = {}, token) => {
  const child = await pullFolder(url, token)
  for (const item of child) {
    console.log(item)
    if (item.type === 'file') {
      const response: AxiosResponse = await axios.get(item.download_url, { transformResponse: res => res })
      obj[item.path] = response.data
    } else {
      // dir
      await githubFolderResolver(item.html_url, obj, token)
    }
  }
  return obj
}

const pullFolder = async (url, token) => {
    url = new URL(url);
    const pathname = url.pathname;
    const pathParts = pathname.split('/');
    const username = pathParts[1];
    const repo = pathParts[2];
    const folderPath = pathParts.slice(5).join('/');
    const apiUrl = `https://api.github.com/repos/${username}/${repo}/contents/${folderPath}`;
    const response = await axios.get(apiUrl,
      { 
        headers: {
          Authorization: `Bearer ${token}`
        } 
      });
    const data = await response.data;
    return data 
}

