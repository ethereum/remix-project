// eslint-disable-next-line no-unused-vars
import axios, { AxiosResponse } from 'axios'

export const githubFolderResolver = async (url, obj = {}, maxDepth, depth?, rootPath?) => {
  depth = depth ? depth : 0
  const child = await pullFolder(url)
  depth = depth++
  const urlObj = new URL(url);
  const pathname = urlObj.pathname;
  const pathParts = pathname.split('/');
  const folderPath = pathParts.slice(5).join('/');
  rootPath =  rootPath || folderPath
  for (const item of child) {
    if (item.type === 'file') {
      const response: AxiosResponse = await axios.get(item.download_url, { transformResponse: res => res })
      obj[item.path.replace(rootPath, '')] = response.data
    } else if (maxDepth > depth) {
      // dir
      await githubFolderResolver(item.html_url, obj, maxDepth, depth, rootPath)
    }
  }
  return obj
}

const pullFolder = async (url) => {
  const response = await axios.get('https://ghfolderpull.remixproject.org', { params: { ghfolder: url } });
  const data = await response.data;
  return data
}

