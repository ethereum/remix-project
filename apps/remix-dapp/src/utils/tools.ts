export function isMobile() {
  const userAgentInfo = navigator.userAgent;
  const mobileAgents = [
    'Android',
    'iPhone',
    'SymbianOS',
    'Windows Phone',
    'iPad',
    'iPod',
  ];
  for (let v = 0; v < mobileAgents.length; v++) {
    if (userAgentInfo.indexOf(mobileAgents[v]) > 0) {
      return true;
    }
  }
  return false;
}
