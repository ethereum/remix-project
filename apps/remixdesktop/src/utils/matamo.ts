import { screen } from 'electron';
import { isPackaged, isE2E } from "../main";

// Function to send events to Matomo
export function trackEvent(category: string, action: string, name: string, value?: string | number, new_visit: number = 0): void {
  if (!category || !action) {
    console.warn('Matomo tracking skipped: category or action missing', { category, action });
    return;
  }

  if ((process.env.NODE_ENV === 'production' || isPackaged) && !isE2E) {
    const chromiumVersion = process.versions.chrome;
    const os = process.platform;
    const osVersion = process.getSystemVersion();
    const ua = `Mozilla/5.0 (${os === 'darwin' ? 'Macintosh' : os === 'win32' ? 'Windows NT' : os === 'linux' ? 'X11; Linux x86_64' : 'Unknown'}; ${osVersion}) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/${chromiumVersion} Safari/537.36`;
    const res = `${screen.getPrimaryDisplay().size.width}x${screen.getPrimaryDisplay().size.height}`;

    console.log('trackEvent', category, action, name, value, ua, new_visit);

    const params = new URLSearchParams({
      idsite: '35',
      rec: '1',
      new_visit: new_visit ? new_visit.toString() : '0',
      e_c: category,
      e_a: action,
      e_n: name || '',
      ua: ua,
      action_name: `${category}:${action}`,
      res: res,
      url: 'https://github.com/remix-project-org/remix-desktop',
      rand: Math.random().toString()
    });

    const eventValue = (typeof value === 'number' && !isNaN(value)) ? value : 1;


    //console.log('Matomo tracking params:', params.toString());

    fetch(`https://ethereumfoundation.matomo.cloud/matomo.php?${params.toString()}`, {
      method: 'GET'
    }).then(async res => {
      if (res.ok) {
        console.log('✅ Event tracked successfully');
      } else {
        console.error('❌ Matomo did not acknowledge event');
      }
    }).catch(err => {
      console.error('Error tracking event:', err);
    });
  }
}
