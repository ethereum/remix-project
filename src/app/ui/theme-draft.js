// THEMEABLE parameters

// REMIX
<<<<<<< HEAD
<<<<<<< HEAD
=======
>>>>>>> Update theme-draft.js
var remixGeneral = {
  general_BackgroundColor: {
    'background-color': ''
  },
  highlight_BackgroundColor: {
    'background-color': ''
  },
  fonts: {
    'font': '',
    'font-size': '',
    mainText: {
      'color': ''
    },
    supportText: {
      'color': ''
    }
  },
  dropdown: {
    'background-color': '',
    'color': ''
  },
  textBox: {
    'background-color': '',
    'border': '',
    'color': ''
  },
  infoTextBox: {
    'background-color': '',
    'border': '',
    'color': ''
  },
  inputField: {
    'background-color': '',
    'color': ''
  },
  icons: {   // All icons
    'color': '',
    ':hover': {
      'color': ''
    }
  },
  butons: {
    'background-color': ''
  },
  copyToClipboard: {  // same as icons @TODO
    'color': '',
    ':hover': {
      'color': ''
    }
  }
<<<<<<< HEAD
=======
var remix = {
  'background-color': '',
  'font': '',
  'font-size': '',
  'color': ''
>>>>>>> Remove styles.css and start theme-draft.js
=======
>>>>>>> Update theme-draft.js
}

// LEFT PANEL
var filePanel = {
<<<<<<< HEAD
<<<<<<< HEAD
  icons: {   // icons
=======
  icons: {
>>>>>>> Remove styles.css and start theme-draft.js
=======
  icons: {   // icons
>>>>>>> Update theme-draft.js
    'color': '',
    ':hover': {
      'color': ''
    }
  },
<<<<<<< HEAD
<<<<<<< HEAD
  togglePannel: {   // icons
=======
  toggle: {
>>>>>>> Remove styles.css and start theme-draft.js
=======
  togglePannel: {   // icons
>>>>>>> Update theme-draft.js
    'color': '',
    ':hover': {
      'color': ''
    }
  },
  treeview: {
<<<<<<< HEAD
<<<<<<< HEAD
    'color': '',   // already defined in Remix general
    highlightedLine: {
      'background-color': ''  // highlight_BackgroundColor
=======
    'color': '',
    highlightedLine: {
      'background-color': ''
>>>>>>> Remove styles.css and start theme-draft.js
=======
    'color': '',   // already defined in Remix general
    highlightedLine: {
      'background-color': ''  // highlight_BackgroundColor
>>>>>>> Update theme-draft.js
    }
  }
}

// EDITOR
var editor = {
<<<<<<< HEAD
<<<<<<< HEAD
  'background-color': '',  // general_BackgroundColor
  'color': '',  // fonts/color
  gutter: {
    'background-color': '',  // highlight_BackgroundColor
    highlightedNumber: {
      'background-color': ''  // highlight_BackgroundColor
    },
  },
  navTabs: {
    'background-color': '',  // highlight_BackgroundColor
    'color': ''  // fonts/color
  },
  icons: {  // icons
=======
  'background-color': '',
  'color': '',
=======
  'background-color': '',  // general_BackgroundColor
  'color': '',  // fonts/color
>>>>>>> Update theme-draft.js
  gutter: {
    'background-color': '',  // highlight_BackgroundColor
    highlightedNumber: {
      'background-color': ''  // highlight_BackgroundColor
    },
  },
  navTabs: {
<<<<<<< HEAD
    'background-color': '',
    'color': ''
  }
  icons: {
>>>>>>> Remove styles.css and start theme-draft.js
=======
    'background-color': '',  // highlight_BackgroundColor
    'color': ''  // fonts/color
  },
  icons: {  // icons
>>>>>>> Update theme-draft.js
    'color': '',
    ':hover': {
      'color': ''
    }
  },
  code: {
    // types, comments, parameters...
    highlightedLine: {
<<<<<<< HEAD
<<<<<<< HEAD
      'background-color': ''   //highlight_BackgroundColor
    },
    debuggerMode: {
      highlightedArea: {
        'background-color': ''   // same as Debug button in Terminal window
      }
    }
  }
=======
      'background-color': ''
=======
      'background-color': ''   //highlight_BackgroundColor
>>>>>>> Update theme-draft.js
    },
    debuggerMode: {
      highlightedArea: {
        'background-color': ''   // same as Debug button in Terminal window
      }
    }
  }
<<<<<<< HEAD

>>>>>>> Remove styles.css and start theme-draft.js
=======
>>>>>>> Update theme-draft.js
}

// TERMINAL
var terminal = {
  menu: {
<<<<<<< HEAD
<<<<<<< HEAD
    'background-color': '', // highlight_BackgroundColor
    'color': '',  // fonts/color
    icons: {  // icons
=======
    'background-color': '',
    'color': '',
    icon: {
>>>>>>> Remove styles.css and start theme-draft.js
=======
    'background-color': '', // highlight_BackgroundColor
    'color': '',  // fonts/color
    icons: {  // icons
>>>>>>> Update theme-draft.js
      'color': '',
      ':hover': {
        'color': ''
      }
    },
<<<<<<< HEAD
<<<<<<< HEAD
    dropdown: {  // dropdown
      'background-color': '',
      'color': ''
    },
    togglePannel: {   // icons
=======
    dropdown: {
      'background-color': ''
    },
    toggle: {
>>>>>>> Remove styles.css and start theme-draft.js
=======
    dropdown: {  // dropdown
      'background-color': '',
      'color': ''
    },
    togglePannel: {   // icons
>>>>>>> Update theme-draft.js
      'color': '',
      ':hover': {
        'color': ''
      }
    }
  },
  terminalWindow: {
    'background-color': '',
<<<<<<< HEAD
<<<<<<< HEAD
    'color': '',
=======
>>>>>>> Remove styles.css and start theme-draft.js
=======
    'color': '',
>>>>>>> Update theme-draft.js
    logo: {
      'url': '',
    },
    infoLog: {
<<<<<<< HEAD
<<<<<<< HEAD
      'color': ''  // fonts/color
    },
    errorLog: {
      'color': ''  // same as border in errorMessage in rightPanel/compileTab  @TODO
=======
      'color': ''
    },
    errorLog: {
      'color': ''
>>>>>>> Remove styles.css and start theme-draft.js
=======
      'color': ''  // fonts/color
    },
    errorLog: {
      'color': ''  // same as border in errorMessage in rightPanel/compileTab  @TODO
>>>>>>> Update theme-draft.js
    },
    transactionLog: {
      title: {
        'color': ''
      },
      text: {
        'color': ''
      },
      detailsButton: {
        'background-color': '',
        'color': ''
<<<<<<< HEAD
<<<<<<< HEAD
      },
      debugButton: {
        'background-color': '',  // same as highlightedArea in editor/debuggerMode
=======
      }
      debugButton: {
        'background-color': '',
>>>>>>> Remove styles.css and start theme-draft.js
=======
      },
      debugButton: {
        'background-color': '',  // same as highlightedArea in editor/debuggerMode
>>>>>>> Update theme-draft.js
        'color': ''
      }
    }
  }
}

// RIGHT PANEL
var rightPanel = {
<<<<<<< HEAD
<<<<<<< HEAD
=======
>>>>>>> Update theme-draft.js
  'background-color': '',  // already defined in Remix general
  'color': '', // already defined in Remix general
  textBox: {        // already defined in Remix general
    'background-color': '',
    'border': '',
    'color': ''
  },
  infoTextBox: {     // already defined in Remix general
    'background-color': '',
    'border': '',
    'color': ''
  },
  togglePannel: {   // icons
<<<<<<< HEAD
=======
  toggle: {
>>>>>>> Remove styles.css and start theme-draft.js
=======
>>>>>>> Update theme-draft.js
    'color': '',
    ':hover': {
      'color': ''
    }
  },
<<<<<<< HEAD
<<<<<<< HEAD
=======
>>>>>>> Update theme-draft.js
  logo: {
    'url': ''
  },
  warningMessage: {
    'border': '',
    'background-color': '',
    'color': ''
  },
  errorMessage: {
    'border': '',   // same as font color in terminal error  @TODO
    'background-color': '',
    'color': ''
  },
  successMessage: {
    'border': '',
    'background-color': '',
    'color': ''
  },
  dropdown: {
    'background-color': '',  // dropdown
    'color': ''
  },
  inputField: {   // inputField
    'background-color': '',
    'color': ''
  },

  compileTab: {
    compileButton: {
      'background-color': '', // or import a special image 'url': ''
      'color': ''
    },
    buttons: {
      'background-color': '',  // general buttons background color
      'color': ''
    },
    details: {
      'background-color': '',  // already defined in Remix general
      header: {
        'background-color': '',  // same as highlight_BackgroundColor
        'color': ''
      },
      infoTextBox: {     // already in rightPanel general theme
        'background-color': '',
        'border': '',
        'color': '',
        copyToClipboard: { // copyToClipboard  @TODO
          'color': '',
          ':hover': {
            'color': ''
          }
        },
        icons: {  // icons
          'color': '',
          ':hover': {
            'color': ''
          }
        },
        title: {
          'color': ''
        }
      }
    }
  },

  runTab: {
    compileButton: {
      'background-color': '', // or import new 'url': ''
      'color': ''
    },
    atAddressButton: {
      'background-color': '',
      'color': ''
    },
    createButton: {
      'background-color': '',
      'color': ''
    },
    instance_callButton: {
      'background-color': '',
      'color': ''
    },
    instance_transactButton: {
      'background-color': '',
      'color': ''
    },
    instance_transactPayableButton: {
      'background-color': '',
      'color': ''
    },
    copyToClipboard: { // copyToClipboard  @TODO
      'color': '',
      ':hover': {
        'color': ''
      }
    }
  },

  settingsTab: {
    infoTextBox: {     // already in rightPanel general theme
      'background-color': '',
      'border': '',
      'color': ''
    }
  },

  debuggerTab: {
    buttons: {
      'background-color': '',  // including eye button (needs to get ${styles.button} applied)
      'color': '',
      icons: {  // icons
        'color': '',
        ':hover': {
          'color': ''
        }
      }
    },
    dropdowns: {  // dropdown
      'background-color': '',  // see if ${styles.dropdown} is applied
      'color': '',
      instructions: {
        highlightedKey: {
          'background-color': ''  // highlight_BackgroundColor
        }
      },
      solidityState: {
        label: {
          'color': ''  // supportText
        }
      }
    }
  },

  analysisTab: {
    textBox: {   // already in rightPanel general theme
      'background-color': '',
      'color': ''
    },
    warningMessage: {  // already in rightPanel general theme
      'border': '',
      'background-color': '',
      'color': ''
    }
  },

  supportTab: {
    textBox: {   // already in rightPanel general theme
      'background-color': '',
      'color': ''
    },
    infoTextBox: {     // already in rightPanel general theme
      'background-color': '',
      'border': '',
      'color': ''
    }
  }
<<<<<<< HEAD
}

/* @TODO

ALL:
- text: mainText or supportText
- unify color and hover for all icons (files panel, debuger, toggle etc.) => maybe add to styleguide

COMPILE TAB:
- details => copyToClipboard (same color and hover as other icons)

RUN TAB:
- unify copyToClipboard color and hover

DEBUGGER TAB:
- apply ${styles.button} + the rest (copy styling from below) to `eye button`
  ${styles.button}
  margin: 3px;
  float: right;

- Put whole debugger in textBox => then we get blue background like on other tabs + we have white background in the textBox so we can make highlighted color same as everywhere else
- apply ${styles.dropdown} to Debugger

TERMINAL:
- apply ${styles.dropdown} + other fixes (already made in one PR - where is it?) to dropdown


*/
=======
}
>>>>>>> Remove styles.css and start theme-draft.js
=======
}

/* @TODO

ALL:
- text: mainText or supportText
- unify color and hover for all icons (files panel, debuger, toggle etc.) => maybe add to styleguide

COMPILE TAB:
- details => copyToClipboard (same color and hover as other icons)

RUN TAB:
- unify copyToClipboard color and hover

DEBUGGER TAB:
- apply ${styles.button} + the rest (copy styling from below) to `eye button`
  ${styles.button}
  margin: 3px;
  float: right;

- Put whole debugger in textBox => then we get blue background like on other tabs + we have white background in the textBox so we can make highlighted color same as everywhere else
- apply ${styles.dropdown} to Debugger

TERMINAL:
- apply ${styles.dropdown} + other fixes (already made in one PR - where is it?) to dropdown


*/
>>>>>>> Update theme-draft.js
