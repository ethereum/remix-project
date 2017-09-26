// var csjs = require('csjs-inject')

module.exports = styleGuide

function styleGuide () {

  /* --------------------------------------------------------------------------

                              CSS PROPERTIES

  -------------------------------------------------------------------------- */
  var css_properties = {

    /****************************
                COLORS
    ************************** */
    colors: {
      // BASIC COLORS (B&W and transparent)
      transparent: 'transparent',
      white: 'hsl(0, 0%, 100%)',
      black: 'hsl(0, 0%, 0%)',
      opacityBlack: 'hsla(0, 0%, 0%, .4)',
      // BLUE
      blue: 'hsla(229, 75%, 87%, 1)',
      lightBlue: 'hsla(229, 75%, 87%, .5)',
      backgroundBlue: 'hsla(229, 100%, 97%, 1)',
      // GREY
      grey: 'hsla(0, 0%, 40%, 1)',
      lightGrey: 'hsla(0, 0%, 40%, .5)',
      veryLightGrey: 'hsla(0, 0%, 40%, .2)',
      // RED
      red: 'hsla(0, 82%, 82%, 1)',
      lightRed: 'hsla(0, 82%, 82%, .5)',
      // GREEN
      green: 'hsla(141, 75%, 84%, 1)',
      lightGreen: 'hsla(141, 75%, 84%, .5)',
      // PINK
      pink: 'hsla(300, 69%, 76%, 1)',
      lightPink: 'hsla(300, 69%, 76%, .5)',
      // YELLOW
      orange: 'hsla(44, 100%, 50%, 1)',
      lightOrange: 'hsla(44, 100%, 50%, .5)',
      // VIOLET
      violet: 'hsla(240, 64%, 68%, 1)'
    },

    /****************************
                FONT
    ************************** */
    fonts: {
    },

    /****************************
                BORDERS
    ************************** */
    borders: {}
  }

  /* --------------------------------------------------------------------------

                                APP PROPERTIES

  -------------------------------------------------------------------------- */

  var app_properties = {

    // BACKGROUND COLORS
    general_BackgroundColor: css_properties.colors.white,
    support_BackgroundColor: css_properties.colors.backgroundBlue,

    // TEXT COLORS
    mainText_Color: css_properties.colors.black,
    supportText_Color: css_properties.colors.grey,

    // ICONS
    icon_Color: css_properties.colors.black,
    icon_HoverColor: css_properties.colors.orange,

    // UI ELEMENTS
    element_TextColor: css_properties.colors.black,
    element_BackgroundColor: css_properties.colors.white,
    element_BorderColor: css_properties.colors.veryLightGrey

  }

/* --------------------------------------------------------------------------

                              REMIX PROPERTIES

-------------------------------------------------------------------------- */

var remix_properties = {

  /****************************
          REMIX GENERAL
  ************************** */
  remix: {
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
    butons: {
      'background-color': ''
    },
    copyToClipboard: {
      color: app_properties.icon_Color,
      hover: {
        color: app_properties.icon_Color
      }
    }
  },

  /****************************
    LEFT PANEL (FILE PANEL)
  ************************** */
  leftPanel: {
    icons: {
      color: app_properties.icon_Color,
      hover: {
        color: app_properties.icon_Color
      }
    },
    togglePannel: {
      color: app_properties.icon_Color,
      hover: {
        color: app_properties.icon_Color
      }
    },
    treeview: {
      color: app_properties.mainText_Color,
      highlightedLine: {
        background: app_properties.support_BackgroundColor
      }
    }
  },

  /****************************
              EDITOR
  ************************** */
  editor: {
    'background-color': '',  // general_BackgroundColor
    'color': '',  // fonts/color
    gutter: {
      background: app_properties.support_BackgroundColor,
      highlightedNumber: {
        background: app_properties.support_BackgroundColor  // support_BackgroundColor
      },
    },
    navTabs: {
      background: app_properties.support_BackgroundColor,
      'color': ''  // fonts/color
    },
    icons: {
      color: app_properties.icon_Color,
      hover: {
        color: app_properties.icon_Color
      }
    },
    code: {
      // types, comments, parameters...
      highlightedLine: {
        background: app_properties.support_BackgroundColor   //support_BackgroundColor
      },
      debuggerMode: {
        highlightedArea: {
          background: app_properties.support_BackgroundColor   // same as Debug button in Terminal window
        }
      }
    }
  },

  /****************************
            TERMINAL
  ************************** */
  terminal: {
    menu: {
      background: app_properties.support_BackgroundColor,
      'color': '',  // fonts/color
      icons: {
        color: app_properties.icon_Color,
        hover: {
          color: app_properties.icon_Color
        }
      },
      dropdown: {  // dropdown
        'background-color': '',
        'color': ''
      },
      togglePannel: {
        color: app_properties.icon_Color,
        hover: {
          color: app_properties.icon_Color
        }
      },
    },
    terminalWindow: {
      'background-color': '',
      'color': '',
      logo: {
        'url': '',
      },
      infoLog: {
        'color': ''  // fonts/color
      },
      errorLog: {
        'color': ''  // same as border in errorMessage in rightPanel/compileTab  @TODO
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
        },
        debugButton: {
          background: app_properties.support_BackgroundColor,
          'color': ''
        }
      }
    }
  },

  /****************************
          RIGHT PANEL
  ************************** */
  rightPanel: {
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
    togglePannel: {
      color: app_properties.icon_Color,
      hover: {
        color: app_properties.icon_Color
      }
    },
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
          background: app_properties.support_BackgroundColor,
          'color': ''
        },
        infoTextBox: {     // already in rightPanel general theme
          'background-color': '',
          'border': '',
          'color': '',
          copyToClipboard: {
            color: app_properties.icon_Color,
            hover: {
              color: app_properties.icon_Color
            }
          },
          icons: {
            color: app_properties.icon_Color,
            hover: {
              color: app_properties.icon_Color
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
      copyToClipboard: {
        color: app_properties.icon_Color,
        hover: {
          color: app_properties.icon_Color
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
        icons: {
          color: app_properties.icon_Color,
          hover: {
            color: app_properties.icon_Color
          }
        }
      },
      dropdowns: {  // dropdown
        'background-color': '',  // see if ${styles.dropdown} is applied
        'color': '',
        instructions: {
          highlightedKey: {
            background: app_properties.support_BackgroundColor
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
  }

}


var elementColors = {
  /* -----------------------
          BUTTONS
  ----------------------- */
  // DROPDOWN
  dropdown_TextColor: app_properties.element_TextColor,
  dropdown_BackgroundColor: app_properties.element_BackgroundColor,
  dropdown_BorderColor: app_properties.element_BorderColor,

  // BUTTON
  button_TextColor: app_properties.element_TextColor,
  button_BorderColor: app_properties.element_BorderColor,
  rightPanel_compileTab_compileButton_BackgroundColor: 'hsla(0, 0%, 40%, .2)',
  rightPanel_compileTab_otherButtons_BackgroundColor: 'hsla(0, 0%, 40%, .2)'

  /* -----------------------
          TEXT BOXES
  ----------------------- */
}
  /* --------------------------------------------------------------------------
                                TEXT-BOXES
  -------------------------------------------------------------------------- */
  var textBoxes = {

    'display-box': `
      font-size             : 12px;
      padding               : 10px 15px;
      line-height           : 20px;
      background            : ${css_properties.colors.white};
      border-radius         : 3px;
      border                : 1px solid ${css_properties.colors.veryLightGrey};
      overflow              : hidden;
      word-break            : break-word;
      width                 : 100%;
    `,

    'info-text-box': `
      background-color      : ${css_properties.colors.white};
      line-height           : 20px;
      border                : .2em dotted ${css_properties.colors.lightGrey};
      padding               : 8px 15px;
      border-radius         : 5px;
      margin-bottom         : 1em;
      overflow              : hidden;
      word-break            : break-word;
    `,

    'input': `
      border                : 1px solid ${css_properties.colors.veryLightGrey};
      height                : 25px;
      width                 : 250px;
      border-radius         : 3px;
      padding               : 0 8px;
      overflow              : hidden;
      word-break            : normal;
    `
  }
  /* --------------------------------------------------------------------------
                                    BUTTONS
  -------------------------------------------------------------------------- */
  var buttons = {

    'button': `
      background-color        : ${elementColors.button_BackgroundColor};
      border                  : .3px solid ${elementColors.button_BorderColor};
      color                   : ${elementColors.button_TextColor};
      display                 : flex;
      align-items             : center;
      justify-content         : center;
      border-radius           : 3px;
      cursor                  : pointer;
      min-height              : 25px;
      max-height              : 25px;
      width                   : 70px;
      min-width               : 70px;
      font-size               : 12px;
      overflow                : hidden;
      word-break              : normal;
    `,

    'button:hover': `
      opacity                 : 0.8;
    `,

    'dropdown': `
      color                   : ${elementColors.dropdown_TextColor};
      background-color        : ${elementColors.dropdown_BackgroundColor};
      border                  : 1px solid ${elementColors.dropdown_BorderColor};
      font-size               : 12px;
      font-weight             : bold;
      padding                 : 0 8px;
      text-decoration         : none;
      cursor                  : pointer;
      border-radius           : 3px;
      height                  : 25px;
      width                   : 250px;
      text-align              : center;
      overflow                : hidden;
      word-break              : normal;
    `

  }

  return {
    colors: css_properties.colors,
    elementColors: elementColors,
    dropdown: buttons['dropdown'],
    button: buttons['button'],
    inputField: textBoxes['input'],
    infoTextBox: textBoxes['info-text-box'],
    displayBox: textBoxes['display-box']
  }
}

/*

COMMENTS

1. most css properties can take many or infinite amounf of different values
=> so we define a set of concrete values that we use:
- variable just for plain colors (later also fonts, widths, paddings, border radiuses...)

2. we define certain semantic names that make sense in the context of our app
=> so we can use the values used in (1.) e.g. like 'color_red'  and assign it to e.g.
- highlightColor: color_red
- borderColor: color_white
- ...

3. we define a nested object that represents the component hierarchy that
makes up our app and use semantic names defined under (2.)

*/
