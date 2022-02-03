import { Plugin } from '@remixproject/engine'
import * as packageJson from '../../../package.json'
const introJs = require('intro.js')

const profile = {
  name: 'walkthrough',
  displayName: 'Walkthrough',
  description: '',
  version: packageJson.version,
  methods: ['start']
}

export class WalkthroughService extends Plugin {
  constructor (appManager, showMatamo) {
    super(profile)
    appManager.event.on('activate', (plugin) => {
      if (plugin.name === 'udapp' && !showMatamo) {
        this.start()
      }
    })
  }

  start () {
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
          element: document.querySelector('#verticalIconsKindsolidity'),
          title: 'Solidity Compiler',
          intro: 'Having selected a .sol file in the File Explorers (the icon above), compile it with the Solidity Compiler.',
          tooltipClass: 'bg-light text-dark',
          position: 'right'
        },
        {
          title: 'Deploy your contract',
          element: document.querySelector('#verticalIconsKindudapp'),
          intro: 'Choose a chain, deploy a contract and play with your functions.',
          tooltipClass: 'bg-light text-dark',
          position: 'right'
        }
        ]
      }).onafterchange((targetElement) => {
        const header = document.getElementsByClassName('introjs-tooltip-header')[0]
        if (header) {
          header.classList.add('d-flex')
          header.classList.add('justify-content-between')
          header.classList.add('text-nowrap')
          header.classList.add('pr-0')
        }
        const skipbutton = document.getElementsByClassName('introjs-skipbutton')[0]
        if (skipbutton) {
          skipbutton.classList.add('ml-3')
          skipbutton.classList.add('text-decoration-none')
          skipbutton.id = 'remixTourSkipbtn'
        }
      }).start()
      localStorage.setItem('hadTour_initial', true)
    }
  }
}
