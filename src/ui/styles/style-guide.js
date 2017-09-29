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
      primary_borderRadius: '3px',
      secondary_borderRadius: '5px'
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
            RESIZING
    ************************** */
    ghostBar: css_properties.colors.lightBlue,
    draggingBar: css_properties.colors.lightBlue,
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
    // Success
    success_TextColor: css_properties.colors.black,
    success_BackgroundColor: css_properties.colors.lightGreen,
    success_BorderColor: css_properties.colors.green,

    // Danger
    danger_TextColor: css_properties.colors.black,
    danger_BackgroundColor: css_properties.colors.lightRed,
    danger_BorderColor: css_properties.colors.red,

    // Warning
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
         SOLID BORDER BOX
    ************************** */
    solidBorderBox_TextColor: css_properties.colors.black,
    solidBorderBox_BackgroundColor: css_properties.colors.violet,
    solidBorderBox_BorderColor: css_properties.colors.veryLightGrey,

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

    /****************************
            UI ELEMENTS
    ************************** */

    uiElements: {

      solidBorderBox: (opts = {}) => `
        background-color      : ${opts.BackgroundColor};
        border                : 1px solid ${opts.BorderColor};
        color                 : ${opts.Color};
        border-radius         : ${css_properties.borders.primary_borderRadius};
        font-size             : 12px;
        padding               : 10px 15px;
        line-height           : 20px;
        overflow              : hidden;
        word-break            : break-word;
        width                 : 100%;
      `,

      dottedBorderBox: (opts = {}) => `
        background-color      : ${opts.BackgroundColor}};
        border                : .2em dotted ${opts.BorderColor};
        color                 : ${opts.Color};
        border-radius         : ${css_properties.borders.secondary_borderRadius};
        line-height           : 20px;
        padding               : 8px 15px;
        margin-bottom         : 1em;
        overflow              : hidden;
        word-break            : break-word;
      `,

      inputField: (opts = {}) =>`
        border                : 1px solid ${css_properties.colors.veryLightGrey};
        height                : 25px;
        width                 : 250px;
        border-radius         : 3px;
        padding               : 0 8px;
        overflow              : hidden;
        word-break            : normal;
      `,

      dropdown: (opts = {}) => `
        background-color      : ${opts.BackgroundColor}};
        border                : 1px solid ${opts.BorderColor};
        color                 : ${opts.Color};
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
      `,

      button: (opts = {}) => `
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
      `
    }
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
    solidBorderBox: {
      background: app_properties.solidBorderBox_BackgroundColor,
      border: app_properties.solidBorderBox_BorderColor,
      color: app_properties.solidBorderBox_TextColor
    },
    infoTextBox: {
      background: app_properties.solidBorderBox_BackgroundColor,
      border: app_properties.solidBorderBox_BorderColor,
      color: app_properties.solidBorderBox_TextColor
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
      inputField: {
        background: app_properties.input_BackgroundColor,
        border: app_properties.input_BorderColor,
        color: app_properties.input_TextColor
      },
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

    backgroundColor_Panel: app_properties.primary_BackgroundColor,
    backgroundColor_Tab: app_properties.secondary_BackgroundColor,

    text_Primary: app_properties.mainText_Color,
    text_Secondary: app_properties.supportText_Color,

    bar_Ghost: app_properties.ghostBar,
    bar_Dragging: app_properties.draggingBar,

    icon_Color_TogglePanel: app_properties.icon_Color,
    icon_HoverColor_TogglePanel: app_properties.icon_HoverColor,

    /* ::::::::::::::
        COMPILE TAB
    ::::::::::::::: */
    compileTab: {

      button_Compile_BackgroundColor: app_properties.primaryButton_BackgroundColor,
      button_Compile_BorderColor: app_properties.primaryButton_BorderColor,
      button_Compile_Color: app_properties.primaryButton_TextColor,

      button_Details_BackgroundColor: app_properties.secondaryButton_BackgroundColor,
      button_Details_BorderColor: app_properties.secondaryButton_BorderColor,
      button_Details_Color: app_properties.secondaryButton_TextColor,

      button_Publish_BackgroundColor: app_properties.secondaryButton_BackgroundColor,
      button_Publish_BorderColor: app_properties.secondaryButton_BorderColor,
      button_Publish_Color: app_properties.secondaryButton_TextColor,

      compileContract_Dropdown: app_properties.uiElements.dropdown({
        BackgroundColor: app_properties.solidBorderBox_BackgroundColor,
        BorderColor:app_properties.solidBorderBox_BorderColor,
        Color: app_properties.solidBorderBox_TextColor
      }),

      compileContainerBox: app_properties.uiElements.solidBorderBox({
        BackgroundColor: app_properties.solidBorderBox_BackgroundColor,
        BorderColor:app_properties.solidBorderBox_BorderColor,
        Color: app_properties.solidBorderBox_TextColor
      }),

      modalDialog_Details_BackgroundColor_Primary: app_properties.primary_BackgroundColor,
      modalDialog_Details_Header_BackgroundColor: app_properties.secondary_BackgroundColor,
      modalDialog_Details_Header_Color: app_properties.mainText_Color,
      modalDialog_Details_BoxDottedBorder_BackgroundColor: app_properties.solidBorderBox_BackgroundColor,
      modalDialog_Details_BoxDottedBorder_BorderColor: app_properties.solidBorderBox_BorderColor,
      modalDialog_Details_BoxDottedBorder_Color: app_properties.solidBorderBox_TextColor,
      modalDialog_Details_CopyToClipboard_Icon_Color: app_properties.icon_Color,
      modalDialog_Details_CopyToClipboard_Icon_HoverColor: app_properties.icon_HoverColor,

      message_Warning_BackgroundColor: app_properties.warning_BackgroundColor,
      message_Warning_BorderColor: app_properties.warning_BorderColor,
      message_Warning_Color: app_properties.warning_TextColor,

      message_Error_BackgroundColor: app_properties.danger_BackgroundColor,
      message_Error_BorderColor: app_properties.danger_BorderColor,
      message_Error_Color: app_properties.danger_TextColor,

      message_Success_BackgroundColor: app_properties.success_BackgroundColor,
      message_Success_BorderColor: app_properties.success_BorderColor,
      message_Success_Color: app_properties.success_TextColor,

    },

    /* ::::::::::::::
        RUN TAB
    ::::::::::::::: */
    runTab: {

      instanceBox: app_properties.uiElements.solidBorderBox({
        BackgroundColor: app_properties.solidBorderBox_BackgroundColor,
        BorderColor:app_properties.solidBorderBox_BorderColor,
        Color: app_properties.solidBorderBox_TextColor
      }),

      runTab_Dropdown: app_properties.uiElements.dropdown({
        BackgroundColor: app_properties.solidBorderBox_BackgroundColor,
        BorderColor:app_properties.solidBorderBox_BorderColor,
        Color: app_properties.solidBorderBox_TextColor
      }),

      inputField_BackgroundColor: app_properties.input_BackgroundColor,
      inputField_BorderColor: app_properties.input_BorderColor,
      inputField_Color: app_properties.input_TextColor,

      atAddressButton_BackgroundColor: app_properties.atAddressButton_BackgroundColor,
      atAddressButton_BorderColor: app_properties.atAddressButton_BorderColor,
      atAddressButton_Color: app_properties.atAddressButton_TextColor,

      createButton_BackgroundColor: app_properties.createButton_BackgroundColor,
      createButton_BorderColor: app_properties.createButton_BorderColor,
      createButton_Color: app_properties.createButton_TextColor,

      instanceButtons_Call_BackgroundColor: app_properties.callButton_BackgroundColor,
      instanceButtons_Call_BorderColor: app_properties.callButton_BorderColor,
      instanceButtons_Call_Color: app_properties.callButton_TextColor,

      instanceButtons_Transact_BackgroundColor: app_properties.transactButton_BackgroundColor,
      instanceButtons_Transact_BorderColor: app_properties.transactButton_BorderColor,
      instanceButtons_Transact_Color: app_properties.transactButton_TextColor,

      instanceButtons_transactPayable_BackgroundColor: app_properties.transactPayableButton_BackgroundColor,
      instanceButtons_transactPayable_BorderColor: app_properties.transactPayableButton_BorderColor,
      instanceButtons_transactPayable_Color: app_properties.transactPayableButton_TextColor,

      instance_copyToClipboard_Icon_Color: app_properties.icon_Color,
      instance_copyToClipboard_Icon__HoverColor: app_properties.icon_HoverColor,

    },

    /* ::::::::::::::
       SETTINGS TAB
    ::::::::::::::: */
    settingsTab: {

      solidityVersionInfoBox: app_properties.uiElements.dottedBorderBox({
        BackgroundColor: app_properties.solidBorderBox_BackgroundColor,
        BorderColor:app_properties.solidBorderBox_BorderColor,
        Color: app_properties.solidBorderBox_TextColor
      }),

      selectCompiler_Dropdown: app_properties.uiElements.dropdown({
        BackgroundColor: app_properties.solidBorderBox_BackgroundColor,
        BorderColor:app_properties.solidBorderBox_BorderColor,
        Color: app_properties.solidBorderBox_TextColor
      }),

    },

    /* ::::::::::::::
      DEBUGGER TAB
    ::::::::::::::: */
    debuggerTab: {

      button_Debugger_BackgroundColor: app_properties.secondaryButton_BackgroundColor,
      button_Debugger_BorderColor: app_properties.secondaryButton_BorderColor,
      button_Debugger_Color: app_properties.secondaryButton_TextColor,

      button_Debugger_icon_Color: app_properties.icon_Color,
      button_Debugger_icon_HoverColor: app_properties.icon_HoverColor,

      debuggerDropdown: app_properties.uiElements.dropdown({
        BackgroundColor: app_properties.solidBorderBox_BackgroundColor,
        BorderColor:app_properties.solidBorderBox_BorderColor,
        Color: app_properties.solidBorderBox_TextColor
      }),

      inputField_BackgroundColor: app_properties.input_BackgroundColor,
      inputField_BorderColor: app_properties.input_BorderColor,
      inputField_Color: app_properties.input_TextColor,

      debuggerDropdowns_Instructions_Highlight_BackgroundColor: app_properties.secondary_BackgroundColor

    },

    /* ::::::::::::::
      ANALYSIS TAB
    ::::::::::::::: */
    analysisTab: {

      button_Run_BackgroundColor: app_properties.primaryButton_BackgroundColor,
      button_Run_BorderColor: app_properties.primaryButton_BorderColor,
      button_Run_Color: app_properties.primaryButton_TextColor,

      analysisContainerBox: app_properties.uiElements.solidBorderBox({
        BackgroundColor: app_properties.solidBorderBox_BackgroundColor,
        BorderColor:app_properties.solidBorderBox_BorderColor,
        Color: app_properties.solidBorderBox_TextColor,
      }),

      message_Warning_BackgroundColor: app_properties.warning_BackgroundColor,
      message_Warning_BorderColor: app_properties.warning_BorderColor,
      message_Warning_Color: app_properties.warning_TextColor

    },

    /* ::::::::::::::
      SUPPORT TAB
    ::::::::::::::: */
    supportTab: {

      iframeContainerBox: app_properties.uiElements.solidBorderBox({
        BackgroundColor: app_properties.solidBorderBox_BackgroundColor,
        BorderColor:app_properties.solidBorderBox_BorderColor,
        Color: app_properties.solidBorderBox_TextColor
      }),

      supportInfoBox: app_properties.uiElements.dottedBorderBox({
        BackgroundColor: app_properties.solidBorderBox_BackgroundColor,
        BorderColor:app_properties.solidBorderBox_BorderColor,
        Color: app_properties.solidBorderBox_TextColor
      })

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
    `,

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
    leftPanel: remix_properties.leftPanel,
    editor: remix_properties.editor,
    terminal: remix_properties.terminal,
    rightPanel: remix_properties.rightPanel,

    elementColors: elementColors,
    dropdown: uiElements['dropdown'],
    button: uiElements['button'],
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
