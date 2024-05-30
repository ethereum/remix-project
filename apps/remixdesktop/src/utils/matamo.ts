import { isE2ELocal } from "../main";
import { isPackaged } from "../main";

var MatomoTracker = require('matomo-tracker');

// Function to send events to Matomo
export function trackEvent(category: string, action: string, name: string, value: string | number): void {
  var matomo = new MatomoTracker(35, 'http://ethereumfoundation.matomo.cloud/matomo.php');
  matomo.on('error', function(err: any) {
    console.log('error tracking request: ', err);
  });

  console.log('Tracking event:', category, action, name, value);
  if((process.env.NODE_ENV === 'production' || isPackaged) && !isE2ELocal){

  }
  matomo.track({
    e_c: category,
    e_a: action,
    e_n: name,
    e_v: value,
    url: 'https://github.com/remix-project-org/remix-desktop'
    // You can add other parameters if needed
  }, (error: any) => {
    if (error) {
      console.error('Error tracking event:', error);
    } else {
      console.log('Event tracked successfully');
    }
  });
}


