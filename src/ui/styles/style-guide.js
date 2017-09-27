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
      font: '14px/1.5 Lato, "Helvetica Neue", Helvetica, Arial, sans-serif',
    },

    /****************************
                BORDERS
    ************************** */
    borders: {
      borderRadius: '3px'
    }
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

    // UI ELEMENTS (dropdown, input)
    element_TextColor: css_properties.colors.black,
    element_BackgroundColor: css_properties.colors.white,
    element_BorderColor: css_properties.colors.veryLightGrey,

    // DROPDOWN
    dropdown_TextColor: css_properties.colors.black,
    dropdown_BackgroundColor: css_properties.colors.white,
    dropdown_BorderColor: css_properties.colors.veryLightGrey,

    // INPUT
    input_TextColor: css_properties.colors.black,
    input_BackgroundColor: css_properties.colors.white,
    input_BorderColor: css_properties.colors.veryLightGrey,

    // INFO BOX
    infoBox_TextColor: css_properties.colors.black,
    infoBox_BackgroundColor: css_properties.colors.white,
    infoBox_BorderColor: css_properties.colors.veryLightGrey,

    // BUTTONS
    // Compile Tab (Right panel)
    compileButton_TextColor: css_properties.colors.black,
    compileButton_BackgroundColor: css_properties.colors.veryLightGrey,
    compileButton_BorderColor: css_properties.colors.veryLightGrey,

    detailsButton_TextColor: css_properties.colors.black,
    detailsButton_BackgroundColor: css_properties.colors.veryLightGrey,
    detailsButton_BorderColor: css_properties.colors.veryLightGrey,

    publishButton_TextColor: css_properties.colors.black,
    publishButton_BackgroundColor: css_properties.colors.veryLightGrey,
    publishButton_BorderColor: css_properties.colors.veryLightGrey,

    // Run Tab (Right panel)
    atAddressButton_TextColor: css_properties.colors.black,
    atAddressButton_BackgroundColor: css_properties.colors.lightGreen,
    atAddressButton_BorderColor: css_properties.colors.lightGreen,

    createButton_TextColor: css_properties.colors.black,
    createButton_BackgroundColor: css_properties.colors.lightRed,
    createButton_BorderColor: css_properties.colors.lightRed,

    instance_callButton_TextColor: css_properties.colors.black ,
    instance_callButton_BackgroundColor: css_properties.colors.lightBlue,
    instance_callButton_BorderColor: css_properties.colors.lightBlue,

    instance_transactButton_TextColor: css_properties.colors.black,
    instance_transactButton_BackgroundColor: css_properties.colors.lightRed,
    instance_transactButton_BorderColor: css_properties.colors.lightRed,

    instance_transactPayableButton_TextColor: css_properties.colors.black,
    instance_transactPayableButton_BackgroundColor: css_properties.colors.red,
    instance_transactPayableButton_BorderColor: css_properties.colors.red,

    // Debugger Tab (Right panel)
    debuggerButton_TextColor: css_properties.colors.black,
    debuggerButton_BackgroundColor: css_properties.colors.veryLightGrey,
    debuggerButton_BorderColor: css_properties.colors.veryLightGrey,

    // Analysis Tab (Right panel)
    runButton_TextColor: css_properties.colors.black,
    runButton_BackgroundColor: css_properties.colors.veryLightGrey,
    runButton_BorderColor: css_properties.colors.veryLightGrey,

    // Support Tab (Right panel)
  }

/* --------------------------------------------------------------------------

                              REMIX PROPERTIES

-------------------------------------------------------------------------- */

var remix_properties = {

  /****************************
          REMIX GENERAL
  ************************** */
  remix: {
    text: {
      font: css_properties.fonts.font,
      mainText: {
        color: app_properties.mainText_Color
      },
      supportText: {
        color: app_properties.supportText_Color
      }
    },
    general_BackgroundColor: app_properties.general_BackgroundColor,
    support_BackgroundColor: app_properties.support_BackgroundColor,
    dropdown: {
      background: app_properties.dropdown_BackgroundColor,
      border: app_properties.dropdown_BorderColor,
      color: app_properties.dropdown_TextColor
    },
    textBox: {
      background: app_properties.infoBox_BackgroundColor,
      border: app_properties.infoBox_BorderColor,
      color: app_properties.infoBox_TextColor
    },
    infoTextBox: {
      background: app_properties.infoBox_BackgroundColor,
      border: app_properties.infoBox_BorderColor,
      color: app_properties.infoBox_TextColor
    },
    inputField: {
      background: app_properties.input_BackgroundColor,
      border: app_properties.input_BorderColor,
      color: app_properties.input_TextColor
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
    background: app_properties.general_BackgroundColor,
    color: app_properties.mainText_Color,
    gutter: {
      background: app_properties.support_BackgroundColor,
      highlightedNumber: {
        background: app_properties.support_BackgroundColor  // support_BackgroundColor
      },
    },
    navTabs: {
      background: app_properties.support_BackgroundColor,
      color: app_properties.mainText_Color,
    },
    icons: {
      color: app_properties.icon_Color,
      hover: {
        color: app_properties.icon_Color
      }
    },
    code: {
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
      color: app_properties.mainText_Color,
      icons: {
        color: app_properties.icon_Color,
        hover: {
          color: app_properties.icon_Color
        }
      },
      dropdown: {
        background: app_properties.dropdown_BackgroundColor,
        border: app_properties.dropdown_BorderColor,
        color: app_properties.dropdown_TextColor
      },
      togglePannel: {
        color: app_properties.icon_Color,
        hover: {
          color: app_properties.icon_Color
        }
      },
    },
    terminalWindow: {
      background: css_properties.colors.veryLightGrey,
      color: '',
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
    background: app_properties.general_BackgroundColor,
    color: app_properties.mainText_Color,
    textBox: {
      background: app_properties.infoBox_BackgroundColor,
      border: app_properties.infoBox_BorderColor,
      color: app_properties.infoBox_TextColor
    },
    infoTextBox: {
      background: app_properties.infoBox_BackgroundColor,
      border: app_properties.infoBox_BorderColor,
      color: app_properties.infoBox_TextColor
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
      background: app_properties.dropdown_BackgroundColor,
      border: app_properties.dropdown_BorderColor,
      color: app_properties.dropdown_TextColor
    },
    inputField: {
      background: app_properties.input_BackgroundColor,
      border: app_properties.input_BorderColor,
      color: app_properties.input_TextColor
    },

    compileTab: {
      compileButton: {
        background: app_properties.compileButton_BackgroundColor,
        border: app_properties.compileButton_BorderColor,
        color: app_properties.compileButton_TextColor,
      },
      detailsButton: {
        background: app_properties.detailsButton_BackgroundColor,
        border: app_properties.detailsButton_BorderColor,
        color: app_properties.detailsButton_TextColor,
      },
      PublishButton: {
        background: app_properties.publishButton_BackgroundColor,
        border: app_properties.publishButton_BorderColor,
        color: app_properties.publishButton_TextColor,
      },
      detailsModalDialog: {
        background: app_properties.general_BackgroundColor,
        header: {
          background: app_properties.support_BackgroundColor,
          color: app_properties.mainText_Color,
        },
        infoTextBox: {     // already in rightPanel general theme
          background: app_properties.element_BackgroundColor,
          border: app_properties.element_BorderColor,
          color: app_properties.element_TextColor,
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
            color: app_properties.mainText_Color
          }
        }
      }
    },

    runTab: {
      atAddressButton: {
        background: app_properties.atAddressButton_BackgroundColor,
        border: app_properties.atAddressButton_BorderColor,
        color: app_properties.atAddressButton_TextColor
      },
      createButton: {
        background: app_properties.createButton_BackgroundColor,
        border: app_properties.createButton_BorderColor,
        color: app_properties.createButton_TextColor
      },
      instance_callButton: {
        background: app_properties.instance_callButton_BackgroundColor,
        border: app_properties.instance_callButton_BorderColor,
        color: app_properties.instance_callButton_TextColor
      },
      instance_transactButton: {
        background: app_properties.instance_transactButton_BackgroundColor,
        border: app_properties.instance_transactButton_BorderColor,
        color: app_properties.instance_transactButton_TextColor
      },
      instance_transactPayableButton: {
        background: app_properties.instance_transactPayableButton_BackgroundColor,
        border: app_properties.instance_transactPayableButton_BorderColor,
        color: app_properties.instance_transactPayableButton_TextColor
      },
      copyToClipboard: {
        color: app_properties.icon_Color,
        hover: {
          color: app_properties.icon_Color
        }
      }
    },

    settingsTab: {
      infoTextBox: {
        background: app_properties.infoBox_BackgroundColor,
        border: app_properties.infoBox_BorderColor,
        color: app_properties.infoBox_TextColor,
      }
    },

    debuggerTab: {
      buttons: {
        debuggerButton_TextColor: css_properties.colors.black,
        debuggerButton_BackgroundColor: css_properties.colors.veryLightGrey,
        debuggerButton_BorderColor: css_properties.colors.veryLightGrey,
        icons: {
          color: app_properties.icon_Color,
          hover: {
            color: app_properties.icon_Color
          }
        }
      },
      dropdowns: {
        background: app_properties.dropdown_BackgroundColor,
        border: app_properties.dropdown_BorderColor,
        color: app_properties.dropdown_TextColor,
        instructions: {
          highlightedKey: {
            background: app_properties.support_BackgroundColor
          }
        },
        solidityState: {
          label: {
            color: app_properties.supportText_Color
          }
        }
      }
    },

    analysisTab: {
      buttons: {
        runButton_TextColor: css_properties.colors.black,
        runButton_BackgroundColor: css_properties.colors.veryLightGrey,
        runButton_BorderColor: css_properties.colors.veryLightGrey
      },
      textBox: {   // already in rightPanel general theme
        background: app_properties.infoBox_BackgroundColor,
        border: app_properties.infoBox_BorderColor,
        color: app_properties.infoBox_TextColor
      },
      warningMessage: {  // already in rightPanel general theme
        'border': '',
        'background-color': '',
        'color': ''
      }
    },

    supportTab: {
      textBox: {   // already in rightPanel general theme
        background: app_properties.infoBox_BackgroundColor,
        border: app_properties.infoBox_BorderColor,
        color: app_properties.infoBox_TextColor
      },
      infoTextBox: {     // already in rightPanel general theme
        background: app_properties.infoBox_BackgroundColor,
        border: app_properties.infoBox_BorderColor,
        color: app_properties.infoBox_TextColor
      }
    }
  }

}


var elementColors = {
  /* -----------------------
          BUTTONS
  ----------------------- */
  // DROPDOWN
  dropdown_TextColor: app_properties.dropdown_TextColor,
  dropdown_BackgroundColor: app_properties.dropdown_BackgroundColor,
  dropdown_BorderColor: app_properties.dropdown_BorderColor,

  // BUTTON
  button_TextColor: app_properties.element_TextColor,
  button_BorderColor: app_properties.element_BorderColor,
  rightPanel_compileTab_compileButton_BackgroundColor: 'hsla(0, 0%, 40%, .2)',
  rightPanel_compileTab_otherButtons_BackgroundColor: 'hsla(0, 0%, 40%, .2)'

}
  /* --------------------------------------------------------------------------
              UI ELEMENTS
  -------------------------------------------------------------------------- */
  var uiElements = {

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
    `,

    'dropdown': `
      color                   : ${css_properties.colors.black};
      background-color        : ${css_properties.colors.white};
      border                  : 1px solid ${css_properties.colors.veryLightGrey};
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
  /* --------------------------------------------------------------------------
                                    BUTTONS
  -------------------------------------------------------------------------- */
  var buttons = {

    'button': `
      background-color        : ${css_properties.colors.veryLightGrey};
      border                  : .3px solid ${css_properties.colors.veryLightGrey};
      color                   : ${css_properties.colors.black};
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
    `

  }

  return {
    colors: css_properties.colors,
    elementColors: elementColors,
    dropdown: uiElements['dropdown'],
    button: buttons['button'],
    inputField: uiElements['input'],
    infoTextBox: uiElements['info-text-box'],
    displayBox: uiElements['display-box']
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
