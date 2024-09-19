import { screen } from 'electron';
import { isPackaged, isE2E } from "../main";


var MatomoTracker = require('matomo-tracker');

// Function to send events to Matomo
export function trackEvent(category: string, action: string, name: string, value: string | number, new_visit: number = 0): void {
  var matomo = new MatomoTracker(35, 'http://ethereumfoundation.matomo.cloud/matomo.php');
  matomo.on('error', function (err: any) {
    console.log('error tracking request: ', err);
  });


  // Customize the user agent
  const electronVersion = process.versions.electron;
  const chromiumVersion = process.versions.chrome;
  const os = process.platform; // 'darwin', 'win32', 'linux', etc.
  const osVersion = process.getSystemVersion();

  const ua = `Electron/${electronVersion} (Chromium/${chromiumVersion}) ${os} ${osVersion}`;


  const res = `${screen.getPrimaryDisplay().size.width}x${screen.getPrimaryDisplay().size.height}`;

  if ((process.env.NODE_ENV === 'production' || isPackaged) && !isE2E) {
    console.log('trackEvent', category, action, name, value, ua, new_visit);
    matomo.track({
      e_c: category,
      e_a: action,
      e_n: name,
      e_v: value,
      ua,
      new_visit,
      res,
      url: 'https://github.com/remix-project-org/remix-desktop'
      // You can add other parameters if needed
    }, (error: any) => {
      if (error) {
        console.error('Error tracking event:', error);
      } else {
        console.log('Event tracked successfully');
      }
    });
  } else {
    console.log('Matomo tracking is disabled');
  }

}


