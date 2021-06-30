const introJs = require('intro.js')

export class WalkthroughService {
  constructor (params) {
    this.params = params
  }

  start (params) {
    if (!localStorage.getItem('hadTour_initial')) {
      introJs().setOptions({
        steps: [{
          title: 'Welcome to Remix IDE',
          intro: 'Click to launch the Home tab that contains links, tips, and shortcuts..',
          element: document.querySelector('#verticalIconsHomeIcon'),
          tooltipClass: 'bg-light text-dark',
          position: 'right'
        },
        {
          element: document.querySelector('#compileIcons'),
          title: 'Solidity Compiler',
          intro: 'Having selected a .sol file in the File Explorers(the icon above), compile it with the Solidity Compiler.',
          tooltipClass: 'bg-light text-dark',
          position: 'right'
        },
        {
          title: 'Deploy your contract',
          element: document.querySelector('#runIcons'),
          intro: 'Choose a chain, deploy a contract and play with your functions.',
          tooltipClass: 'bg-light text-dark',
          position: 'right'
        },
        {
          title: 'The plugins world',
          element: document.querySelector('#settingsIcons'),
          intro: 'Explore more plugins and manage permissions.',
          tooltipClass: 'bg-light text-dark',
          position: 'right',
          doneLabel: 'Done!'
        }
        ]
      }).start()
      localStorage.setItem('hadTour_initial', true)
    }
  }

  startFeatureTour () {
  }
}
