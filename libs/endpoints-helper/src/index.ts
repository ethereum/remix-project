type EndpointUrls = {
    corsProxy: string;
    solidityScan: string;
    ipfsGateway: string;
    commonCorsProxy: string;
    github: string;
    solcoder: string;
    completion: string;
    ghfolderpull: string;
    embedly: string;
    gptChat: string;
    rag: string;
    vyper2: string;
    solidityScanWebSocket: string;
};

const defaultUrls: EndpointUrls = {
  corsProxy: 'https://corsproxy.remixproject.org',
  solidityScan: 'https://solidityscan.remixproject.org',
  ipfsGateway: 'https://jqgt.remixproject.org',
  commonCorsProxy: 'https://common-corsproxy.remixproject.org',
  github: 'https://github.remixproject.org',
  solcoder: 'https://solcoder.remixproject.org',
  ghfolderpull: 'https://ghfolderpull.remixproject.org',
  embedly: 'https://embedly.remixproject.org',
  gptChat: 'https://gpt-chat.remixproject.org',
  rag: 'https://rag.remixproject.org',
  vyper2: 'https://vyper2.remixproject.org',
  completion: 'https://completion.remixproject.org',
  solidityScanWebSocket: 'wss://solidityscan.remixproject.org',
};

const endpointPathMap: Record<keyof EndpointUrls, string> = {
  corsProxy: 'corsproxy',
  solidityScan: 'solidityscan',
  ipfsGateway: 'jqgt',
  commonCorsProxy: 'common-corsproxy',
  github: 'github',
  solcoder: 'solcoder',
  completion: 'completion',
  ghfolderpull: 'ghfolderpull',
  embedly: 'embedly',
  gptChat: 'gpt-chat',
  rag: 'rag',
  vyper2: 'vyper2',
  solidityScanWebSocket: '',
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

resolvedUrls.solidityScanWebSocket = resolvedUrls.solidityScan.replace(
  'http://',
  'ws://'
);

export const endpointUrls = resolvedUrls;
