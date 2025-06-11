export { RemixURLResolver } from './resolve'
export { githubFolderResolver } from './github-folder-resolver'

type EndpointUrls = {
    ipfsGateway: string;
    ghfolderpull: string;
};

const defaultUrls: EndpointUrls = {
  ipfsGateway: 'https://jqgt.api.remix.live',
  ghfolderpull: 'https://ghfolderpull.api.remix.live',
};

const endpointPathMap: Record<keyof EndpointUrls, string> = {
  ipfsGateway: 'jqgt',
  ghfolderpull: 'ghfolderpull',
};

const prefix = process.env.NX_ENDPOINTS_URL;

const resolvedUrls: EndpointUrls = prefix
  ? Object.fromEntries(
    Object.entries(defaultUrls).map(([key, _]) => [
      key,
      `${prefix}/${endpointPathMap[key as keyof EndpointUrls]}`,
    ])
  ) as EndpointUrls
  : defaultUrls;

export const endpointUrls = resolvedUrls;
