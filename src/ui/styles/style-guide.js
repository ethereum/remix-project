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

    /****************************
          BACKGROUND COLORS
    ************************** */
    primary_BackgroundColor: css_properties.colors.white,
    secondary_BackgroundColor: css_properties.colors.backgroundBlue,
    dark_BackgroundColor: css_properties.colors.veryLightGrey,
    /****************************
            TEXT COLORS
    ************************** */
    mainText_Color: css_properties.colors.black,
    supportText_Color: css_properties.colors.grey,
    errorText_Color: css_properties.colors.red,
    warningText_Color: css_properties.colors.orange,
    /****************************
               ICONS
    ************************** */
    icon_Color: css_properties.colors.black,
    icon_HoverColor: css_properties.colors.orange,

    /****************************
            MESSAGES
    ************************** */
    // success
    success_TextColor: css_properties.colors.black,
    success_BackgroundColor: css_properties.colors.lightGreen,
    success_BorderColor: css_properties.colors.green,

    // danger
    danger_TextColor: css_properties.colors.black,
    danger_BackgroundColor: css_properties.colors.lightRed,
    danger_BorderColor: css_properties.colors.red,

    // warning
    warning_TextColor: css_properties.colors.black,
    warning_BackgroundColor: css_properties.colors.lightOrange,
    warning_BorderColor: css_properties.colors.orange,

    /****************************
              DROPDOWN
    ************************** */
    dropdown_TextColor: css_properties.colors.black,
    dropdown_BackgroundColor: css_properties.colors.white,
    dropdown_BorderColor: css_properties.colors.veryLightGrey,

    /****************************
              INPUT
    ************************** */
    input_TextColor: css_properties.colors.black,
    input_BackgroundColor: css_properties.colors.white,
    input_BorderColor: css_properties.colors.veryLightGrey,

    /****************************
              INFO BOX
    ************************** */
    infoBox_TextColor: css_properties.colors.black,
    infoBox_BackgroundColor: css_properties.colors.white,
    infoBox_BorderColor: css_properties.colors.veryLightGrey,

    /****************************
              BUTTONS
    ************************** */

    /* .................
          PRIMARY
    .................. */
    primaryButton_TextColor: css_properties.colors.white,
    primaryButton_BackgroundColor: css_properties.colors.blue,
    primaryButton_BorderColor: css_properties.colors.blue,

    /* .................
          SECONDARY
    .................. */
    secondaryButton_TextColor: css_properties.colors.black,
    secondaryButton_BackgroundColor: css_properties.colors.lightGrey,
    secondaryButton_BorderColor: css_properties.colors.lightGrey,

    /* .................
          SUCCESS
    .................. */
    successButton_TextColor: css_properties.colors.white,
    successButton_BackgroundColor: css_properties.colors.green,
    successButton_BorderColor: css_properties.colors.green,

    /* .................
          DANGER
    .................. */
    dangerButton_TextColor: css_properties.colors.white,
    dangerButton_BackgroundColor: css_properties.colors.red,
    dangerButton_BorderColor: css_properties.colors.red,

    /* .................
          WARNING
    .................. */
    warningButton_TextColor: css_properties.colors.white,
    warningButton_BackgroundColor: css_properties.colors.orange,
    warningButton_BorderColor: css_properties.colors.orange,

    /* .................
          INFO
    .................. */
    infoButton_TextColor: css_properties.colors.black,
    infoButton_BackgroundColor: css_properties.colors.white,
    infoButton_BorderColor: css_properties.colors.veryLightGrey,

    /* .................
          SOLIDITY
    .................. */

    // CALL
    callButton_TextColor: css_properties.colors.black,
    callButton_BackgroundColor: css_properties.colors.white,
    callButton_BorderColor: css_properties.colors.blue,

    // TRANSACTION
    transactButton_TextColor: css_properties.colors.black,
    transactButton_BackgroundColor: css_properties.colors.white,
    transactButton_BorderColor: css_properties.colors.pink,

    // PAYABLE TRANSACTION
    transactPayableButton_TextColor: css_properties.colors.black,
    transactPayableButton_BackgroundColor: css_properties.colors.white,
    transactPayableButton_BorderColor: css_properties.colors.violet,

    // Run Tab (Right panel)
    atAddressButton_TextColor: css_properties.colors.black,
    atAddressButton_BackgroundColor: css_properties.colors.lightGreen,
    atAddressButton_BorderColor: css_properties.colors.lightGreen,

    createButton_TextColor: css_properties.colors.black,
    createButton_BackgroundColor: css_properties.colors.lightRed,
    createButton_BorderColor: css_properties.colors.lightRed,

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
    primary_BackgroundColor: app_properties.primary_BackgroundColor,
    secondary_BackgroundColor: app_properties.secondary_BackgroundColor,
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
        background: app_properties.secondary_BackgroundColor
      }
    }
  },

  /****************************
              EDITOR
  ************************** */
  editor: {
    background: app_properties.primary_BackgroundColor,
    color: app_properties.mainText_Color,
    gutter: {
      background: app_properties.secondary_BackgroundColor,
      highlightedNumber: {
        background: app_properties.secondary_BackgroundColor  // secondary_BackgroundColor
      },
    },
    navTabs: {
      background: app_properties.secondary_BackgroundColor,
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
        background: app_properties.secondary_BackgroundColor   //secondary_BackgroundColor
      },
      debuggerMode: {
        highlightedArea: {
          background: app_properties.secondary_BackgroundColor   // same as Debug button in Terminal window
        }
      }
    }
  },

  /****************************
            TERMINAL
  ************************** */
  terminal: {
    menu: {
      background: app_properties.secondary_BackgroundColor,
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
      background: app_properties.dark_BackgroundColor,
      logo: {
        url: '',
      },
      infoLog: {
        color: app_properties.mainText_Color,
      },
      errorLog: {
        color: app_properties.errorText_Color,
      },
      transactionLog: {
        title: {
          color: app_properties.warningText_Color,
        },
        text: {
          color: app_properties.supportText_Color,
        },
        detailsButton: {
          background: app_properties.secondaryButton_BackgroundColor,
          border: app_properties.secondaryButton_BorderColor,
          color: app_properties.secondaryButton_TextColor
        },
        debugButton: {
          background: app_properties.warningButton_BackgroundColor,
          border: app_properties.warningButton_BorderColor,
          color: app_properties.warningButton_TextColor
        }
      }
    }
  },

  /****************************
          RIGHT PANEL
  ************************** */
  rightPanel: {
    background: app_properties.primary_BackgroundColor,
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
      url: ''
    },
    warningMessage: {
      background: app_properties.warning_BackgroundColor,
      border: app_properties.warning_BorderColor,
      color: app_properties.warning_TextColor
    },
    errorMessage: {
      background: app_properties.danger_BackgroundColor,
      border: app_properties.danger_BorderColor,
      color: app_properties.danger_TextColor
    },
    successMessage: {
      background: app_properties.success_BackgroundColor,
      border: app_properties.success_BorderColor,
      color: app_properties.success_TextColor
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
        background: app_properties.primaryButton_BackgroundColor,
        border: app_properties.primaryButton_BorderColor,
        color: app_properties.primaryButton_TextColor,
      },
      detailsButton: {
        background: app_properties.secondaryButton_BackgroundColor,
        border: app_properties.secondaryButton_BorderColor,
        color: app_properties.secondaryButton_TextColor,
      },
      PublishButton: {
        background: app_properties.secondaryButton_BackgroundColor,
        border: app_properties.secondaryButton_BorderColor,
        color: app_properties.secondaryButton_TextColor,
      },
      detailsModalDialog: {
        background: app_properties.primary_BackgroundColor,
        header: {
          background: app_properties.secondary_BackgroundColor,
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
      instanceButtons: {
        callButton: {
          background: app_properties.callButton_BackgroundColor,
          border: app_properties.callButton_BorderColor,
          color: app_properties.callButton_TextColor
        },
        transactButton: {
          background: app_properties.transactButton_BackgroundColor,
          border: app_properties.transactButton_BorderColor,
          color: app_properties.transactButton_TextColor
        },
        transactPayableButton: {
          background: app_properties.transactPayableButton_BackgroundColor,
          border: app_properties.transactPayableButton_BorderColor,
          color: app_properties.transactPayableButton_TextColor
        }
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
        debuggerButton_TextColor: app_properties.secondaryButton_TextColor,
        debuggerButton_BackgroundColor: app_properties.secondaryButton_BackgroundColor,
        debuggerButton_BorderColor: app_properties.secondaryButton_BorderColor,
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
            background: app_properties.secondary_BackgroundColor
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
        runButton_TextColor: app_properties.primaryButton_TextColor,
        runButton_BackgroundColor: app_properties.primaryButton_BackgroundColor,
        runButton_BorderColor: app_properties.primaryButton_BorderColor
      },
      textBox: {   // already in rightPanel general theme
        background: app_properties.infoBox_BackgroundColor,
        border: app_properties.infoBox_BorderColor,
        color: app_properties.infoBox_TextColor
      },
      warningMessage: {  // already in rightPanel general theme
        background: app_properties.warning_BackgroundColor,
        border: app_properties.warning_BorderColor,
        color: app_properties.warning_TextColor
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
  dropdown_TextColor: css_properties.colors.black,
  dropdown_BackgroundColor: css_properties.colors.white,
  dropdown_BorderColor: css_properties.colors.veryLightGrey,

  // BUTTON
  button_TextColor: css_properties.element_TextColor,
  button_BorderColor: css_properties.colors.veryLightGrey,
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
      margin                  : 1px;
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
