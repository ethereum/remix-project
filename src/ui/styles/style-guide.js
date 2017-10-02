// var csjs = require('csjs-inject')

module.exports = styleGuide

function styleGuide () {

  /* --------------------------------------------------------------------------

                              CSS PROPERTIES

  -------------------------------------------------------------------------- */
  var css_properties = {

  /********************************************************
                            COLORS
  ******************************************************** */
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

  /********************************************************
                            FONTS
  ******************************************************** */
    fonts: {
      font: '14px/1.5 Lato, "Helvetica Neue", Helvetica, Arial, sans-serif',
    },

  /********************************************************
                                BORDERS
  ******************************************************** */
    borders: {
      primary_borderRadius: '3px',
      secondary_borderRadius: '5px'
    }
  }

  /* --------------------------------------------------------------------------

                                APP PROPERTIES

  -------------------------------------------------------------------------- */

  var app_properties = {

  /********************************************************
                        BACKGROUND COLORS
  ******************************************************** */
    primary_BackgroundColor: css_properties.colors.white,
    secondary_BackgroundColor: css_properties.colors.backgroundBlue,
    dark_BackgroundColor: css_properties.colors.veryLightGrey,
    light_BackgroundColor: css_properties.colors.white,

  /********************************************************
                            RESIZING
  ******************************************************** */
    ghostBar: css_properties.colors.lightBlue,
    draggingBar: css_properties.colors.lightBlue,

  /********************************************************
                          TEXT COLORS
  ******************************************************** */
    mainText_Color: css_properties.colors.black,
    supportText_Color: css_properties.colors.grey,
    errorText_Color: css_properties.colors.red,
    warningText_Color: css_properties.colors.orange,

  /********************************************************
                            ICONS
  ******************************************************** */
    icon_Color: css_properties.colors.black,
    icon_HoverColor: css_properties.colors.orange,

  /********************************************************
                          MESSAGES
  ******************************************************** */
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

  /********************************************************
                        DROPDOWN
  ******************************************************** */
    dropdown_TextColor: css_properties.colors.black,
    dropdown_BackgroundColor: css_properties.colors.white,
    dropdown_BorderColor: css_properties.colors.veryLightGrey,

  /********************************************************
                          INPUT
  ******************************************************** */
    input_TextColor: css_properties.colors.black,
    input_BackgroundColor: css_properties.colors.white,
    input_BorderColor: css_properties.colors.veryLightGrey,

  /********************************************************
                    SOLID BORDER BOX
  ******************************************************** */
    solidBorderBox_TextColor: css_properties.colors.black,
    solidBorderBox_BackgroundColor: css_properties.colors.white,
    solidBorderBox_BorderColor: css_properties.colors.veryLightGrey,

  /********************************************************
                        BUTTONS
  ******************************************************** */

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
    callButton_BackgroundColor: css_properties.colors.lightBlue,
    callButton_BorderColor: css_properties.colors.lightBlue,

    // TRANSACTION
    transactButton_TextColor: css_properties.colors.black,
    transactButton_BackgroundColor: css_properties.colors.lightRed,
    transactButton_BorderColor: css_properties.colors.lightRed,

    // PAYABLE TRANSACTION
    transactPayableButton_TextColor: css_properties.colors.black,
    transactPayableButton_BackgroundColor: css_properties.colors.red,
    transactPayableButton_BorderColor: css_properties.colors.red,

  /********************************************************
                          UI ELEMENTS
  ******************************************************** */

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
        background-color      : ${opts.BackgroundColor};
        border                : .2em dotted ${opts.BorderColor};
        color                 : ${opts.Color};
        border-radius         : ${css_properties.borders.secondary_borderRadius};
        line-height           : 20px;
        padding               : 8px 15px;
        margin-bottom         : 1em;
        overflow              : hidden;
        word-break            : break-word;
      `,

      inputField: (opts = {}) => `
        background-color      : ${opts.BackgroundColor};
        border                : 1px solid ${opts.BorderColor};
        color                 : ${opts.Color};
        border-radius         : ${css_properties.borders.secondary_borderRadius};
        height                : 25px;
        width                 : 250px;
        padding               : 0 8px;
        overflow              : hidden;
        word-break            : normal;
      `,

      dropdown: (opts = {}) => `
        background-color      : ${opts.BackgroundColor};
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
      background-color        : ${opts.BackgroundColor};
      border                  : .3px solid ${opts.BorderColor};
      color                   : ${opts.Color};
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

/********************************************************
                        REMIX GENERAL
/******************************************************** */
  remix: {

    modalDialog_BackgroundColor_Primary: app_properties.primary_BackgroundColor,
    modalDialog_text_Primary: app_properties.mainText_Color,
    modalDialog_text_Secondary: app_properties.supportText_Color,
    modalDialog_Header_Footer_BackgroundColor: app_properties.secondary_BackgroundColor,
    modalDialog_Header_Footer_Color: app_properties.mainText_Color,
    modalDialog_BoxDottedBorder_BackgroundColor: app_properties.solidBorderBox_BackgroundColor,
    modalDialog_BoxDottedBorder_BorderColor: app_properties.solidBorderBox_BorderColor,
    modalDialog_BoxDottedBorder_Color: app_properties.solidBorderBox_TextColor,
    modalDialog_CopyToClipboard_Icon_Color: app_properties.icon_Color,
    modalDialog_CopyToClipboard_Icon_HoverColor: app_properties.icon_HoverColor

  },

/********************************************************
                LEFT PANEL (FILE PANEL)
/******************************************************** */
  leftPanel: {

    backgroundColor_Panel: app_properties.primary_BackgroundColor,
    backgroundColor_FileExplorer: app_properties.secondary_BackgroundColor,

    text_Primary: app_properties.mainText_Color,
    text_Secondary: app_properties.supportText_Color,

    bar_Ghost: app_properties.ghostBar,
    bar_Dragging: app_properties.draggingBar,

    icon_Color_Menu: app_properties.icon_Color,
    icon_HoverColor_Menu: app_properties.icon_HoverColor,

    icon_Color_TogglePanel: app_properties.icon_Color,
    icon_HoverColor_TogglePanel: app_properties.icon_HoverColor,

  },

/********************************************************
                          EDITOR
/******************************************************** */
  editor: {

    backgroundColor_Panel: app_properties.primary_BackgroundColor,
    backgroundColor_Editor: app_properties.light_BackgroundColor,
    backgroundColor_Tabs_Highlights: app_properties.secondary_BackgroundColor,
    backgroundColor_DebuggerMode: app_properties.warning_BackgroundColor,

    text_Primary: app_properties.mainText_Color,
    text_Secondary: app_properties.supportText_Color,
    text_Editor: '',

    icon_Color_Editor: app_properties.icon_Color,
    icon_HoverColor_Editor: app_properties.icon_HoverColor,

  },

/********************************************************
                      TERMINAL
/******************************************************** */
  terminal: {

    backgroundColor_Menu: app_properties.secondary_BackgroundColor,
    backgroundColor_Terminal: app_properties.dark_BackgroundColor,

    text_Primary: app_properties.mainText_Color,
    text_Secondary: app_properties.supportText_Color,
    text_RegularLog: app_properties.mainText_Color,
    text_InfoLog: app_properties.supportText_Color,
    text_ErrorLog: app_properties.errorText_Color,
    text_Title_TransactionLog: app_properties.warningText_Color,
    text_Regular_TransactionLog: app_properties.supportText_Color,

    icon_Color_TogglePanel: app_properties.icon_Color,
    icon_HoverColor_TogglePanel: app_properties.icon_HoverColor,
    icon_Color_Menu: app_properties.icon_Color,
    icon_HoverColor_Menu: app_properties.icon_HoverColor,
    icon_Color_CopyToClipboard: app_properties.icon_Color,
    icon_HoverColor_CopyToClipboard: app_properties.icon_HoverColor,

    bar_Ghost: app_properties.ghostBar,
    bar_Dragging: app_properties.draggingBar,

    input_Search_MenuBar: app_properties.uiElements.inputField({
      BackgroundColor: app_properties.input_BackgroundColor,
      BorderColor: app_properties.input_BorderColor,
      Color: app_properties.input_TextColor
    }),

    dropdown_Filter_MenuBar: app_properties.uiElements.dropdown({
      BackgroundColor: app_properties.dropdown_BackgroundColor,
      BorderColor: app_properties.dropdown_BorderColor,
      Color: app_properties.dropdown_TextColor
    }),

    button_Log_Debug: app_properties.uiElements.button({
      BackgroundColor: app_properties.warningButton_BackgroundColor,
      BorderColor: app_properties.warningButton_BorderColor,
      Color: app_properties.warningButton_TextColor
    }),

    button_Log_Details: app_properties.uiElements.button({
      BackgroundColor: app_properties.secondaryButton_BackgroundColor,
      BorderColor: app_properties.secondaryButton_BorderColor,
      Color: app_properties.secondaryButton_TextColor
    })

  },

/********************************************************
                          RIGHT PANEL
/******************************************************** */
  rightPanel: {

    backgroundColor_Panel: app_properties.primary_BackgroundColor,
    backgroundColor_Tab: app_properties.secondary_BackgroundColor,
    BackgroundColor_Pre: app_properties.light_BackgroundColor,

    text_Primary: app_properties.mainText_Color,
    text_Secondary: app_properties.supportText_Color,

    bar_Ghost: app_properties.ghostBar,
    bar_Dragging: app_properties.draggingBar,

    icon_Color_TogglePanel: app_properties.icon_Color,
    icon_HoverColor_TogglePanel: app_properties.icon_HoverColor,

    message_Warning_BackgroundColor: app_properties.warning_BackgroundColor,
    message_Warning_BorderColor: app_properties.warning_BorderColor,
    message_Warning_Color: app_properties.warning_TextColor,

    message_Error_BackgroundColor: app_properties.danger_BackgroundColor,
    message_Error_BorderColor: app_properties.danger_BorderColor,
    message_Error_Color: app_properties.danger_TextColor,

    message_Success_BackgroundColor: app_properties.success_BackgroundColor,
    message_Success_BorderColor: app_properties.success_BorderColor,
    message_Success_Color: app_properties.success_TextColor,

    /* ::::::::::::::
        COMPILE TAB
    ::::::::::::::: */
    compileTab: {

      button_Compile: app_properties.uiElements.button({
        BackgroundColor: app_properties.primaryButton_BackgroundColor,
        BorderColor: app_properties.primaryButton_BorderColor,
        Color: app_properties.primaryButton_TextColor
      }),

      button_Details: app_properties.uiElements.button({
        BackgroundColor: app_properties.secondaryButton_BackgroundColor,
        BorderColor: app_properties.secondaryButton_BorderColor,
        Color: app_properties.secondaryButton_TextColor
      }),

      button_Publish: app_properties.uiElements.button({
        BackgroundColor: app_properties.secondaryButton_BackgroundColor,
        BorderColor: app_properties.secondaryButton_BorderColor,
        Color: app_properties.secondaryButton_TextColor
      }),

      dropdown_CompileContract: app_properties.uiElements.dropdown({
        BackgroundColor: app_properties.dropdown_BackgroundColor,
        BorderColor: app_properties.dropdown_BorderColor,
        Color: app_properties.dropdown_TextColor
      }),

      box_CompileContainer: app_properties.uiElements.solidBorderBox({
        BackgroundColor: app_properties.solidBorderBox_BackgroundColor,
        BorderColor:app_properties.solidBorderBox_BorderColor,
        Color: app_properties.solidBorderBox_TextColor
      }),

      icon_WarnCompilation_Color: app_properties.warning_BackgroundColor,

    },

    /* ::::::::::::::
        RUN TAB
    ::::::::::::::: */
    runTab: {

      box_RunTab: app_properties.uiElements.solidBorderBox({
        BackgroundColor: app_properties.solidBorderBox_BackgroundColor,
        BorderColor:app_properties.solidBorderBox_BorderColor,
        Color: app_properties.solidBorderBox_TextColor
      }),

      dropdown_RunTab: app_properties.uiElements.dropdown({
        BackgroundColor: app_properties.dropdown_BackgroundColor,
        BorderColor: app_properties.dropdown_BorderColor,
        Color: app_properties.dropdown_TextColor
      }),

      input_RunTab: app_properties.uiElements.inputField({
        BackgroundColor: app_properties.input_BackgroundColor,
        BorderColor: app_properties.input_BorderColor,
        Color: app_properties.input_TextColor
      }),

      box_Instance: app_properties.uiElements.solidBorderBox({
        BackgroundColor: app_properties.solidBorderBox_BackgroundColor,
        BorderColor:app_properties.solidBorderBox_BorderColor,
        Color: app_properties.solidBorderBox_TextColor
      }),

      button_atAddress: app_properties.uiElements.button({
        BackgroundColor: app_properties.primaryButton_BackgroundColor,
        BorderColor: app_properties.primaryButton_BorderColor,
        Color: app_properties.primaryButton_TextColor
      }),

      button_Create: app_properties.uiElements.button({
        BackgroundColor: app_properties.primaryButton_BackgroundColor,
        BorderColor: app_properties.primaryButton_BorderColor,
        Color: app_properties.primaryButton_TextColor
      }),

      button_Instance_Call: app_properties.uiElements.button({
        BackgroundColor: app_properties.callButton_BackgroundColor,
        BorderColor: app_properties.callButton_BorderColor,
        Color: app_properties.callButton_TextColor
      }),

      button_Instance_Transact: app_properties.uiElements.button({
        BackgroundColor: app_properties.transactButton_BackgroundColor,
        BorderColor: app_properties.transactButton_BorderColor,
        Color: app_properties.transactButton_TextColor
      }),

      button_Instance_TransactPayable: app_properties.uiElements.button({
        BackgroundColor: app_properties.transactPayableButton_BackgroundColor,
        BorderColor: app_properties.transactPayableButton_BorderColor,
        Color: app_properties.transactPayableButton_TextColor
      }),

      icon_Color_Instance_CopyToClipboard: app_properties.icon_Color,
      icon_HoverColor_Instance_CopyToClipboard: app_properties.icon_HoverColor,

    },

    /* ::::::::::::::
       SETTINGS TAB
    ::::::::::::::: */
    settingsTab: {

      box_SolidityVersionInfo: app_properties.uiElements.dottedBorderBox({
        BackgroundColor: app_properties.solidBorderBox_BackgroundColor,
        BorderColor:app_properties.solidBorderBox_BorderColor,
        Color: app_properties.solidBorderBox_TextColor
      }),

      dropdown_SelectCompiler: app_properties.uiElements.dropdown({
        BackgroundColor: app_properties.dropdown_BackgroundColor,
        BorderColor: app_properties.dropdown_BorderColor,
        Color: app_properties.dropdown_TextColor
      }),

    },

    /* ::::::::::::::
      DEBUGGER TAB
    ::::::::::::::: */
    debuggerTab: {

      text_Primary: app_properties.mainText_Color,
      text_Secondary: app_properties.supportText_Color,

      box_Debugger: app_properties.uiElements.solidBorderBox({
        BackgroundColor: app_properties.solidBorderBox_BackgroundColor,
        BorderColor:app_properties.solidBorderBox_BorderColor,
        Color: app_properties.solidBorderBox_TextColor
      }),

      button_Debugger: app_properties.uiElements.button({
        BackgroundColor: app_properties.primaryButton_BackgroundColor,
        BorderColor: app_properties.primaryButton_BorderColor,
        Color: app_properties.primaryButton_TextColor
      }),

      button_Debugger_icon_Color: app_properties.icon_Color,
      button_Debugger_icon_HoverColor: app_properties.icon_HoverColor,

      dropdown_Debugger: app_properties.uiElements.dropdown({
        BackgroundColor: app_properties.dropdown_BackgroundColor,
        BorderColor: app_properties.dropdown_BorderColor,
        Color: app_properties.dropdown_TextColor
      }),

      input_Debugger: app_properties.uiElements.inputField({
        BackgroundColor: app_properties.input_BackgroundColor,
        BorderColor: app_properties.input_BorderColor,
        Color: app_properties.input_TextColor
      }),

      debuggerDropdowns_Instructions_Highlight_BackgroundColor: app_properties.secondary_BackgroundColor

    },

    /* ::::::::::::::
      ANALYSIS TAB
    ::::::::::::::: */
    analysisTab: {

      button_Run_AnalysisTab: app_properties.uiElements.button({
        BackgroundColor: app_properties.primaryButton_BackgroundColor,
        BorderColor: app_properties.primaryButton_BorderColor,
        Color: app_properties.primaryButton_TextColor
      }),

      box_AnalysisContainer: app_properties.uiElements.solidBorderBox({
        BackgroundColor: app_properties.solidBorderBox_BackgroundColor,
        BorderColor:app_properties.solidBorderBox_BorderColor,
        Color: app_properties.solidBorderBox_TextColor,
      }),

    },

    /* ::::::::::::::
      SUPPORT TAB
    ::::::::::::::: */
    supportTab: {

      box_IframeContainer: app_properties.uiElements.solidBorderBox({
        BackgroundColor: app_properties.solidBorderBox_BackgroundColor,
        BorderColor:app_properties.solidBorderBox_BorderColor,
        Color: app_properties.solidBorderBox_TextColor
      }),

      box_SupportInfo: app_properties.uiElements.dottedBorderBox({
        BackgroundColor: app_properties.solidBorderBox_BackgroundColor,
        BorderColor:app_properties.solidBorderBox_BorderColor,
        Color: app_properties.solidBorderBox_TextColor
      })

    }

  }
}

  return {
    colors: css_properties.colors,
    app_properties: app_properties,
    borders: css_properties.borders,
    leftPanel: remix_properties.leftPanel,
    editor: remix_properties.editor,
    terminal: remix_properties.terminal,
    rightPanel: remix_properties.rightPanel,
    remix: remix_properties.remix
  }
}
