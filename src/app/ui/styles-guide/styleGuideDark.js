module.exports = styleGuideDark

function styleGuideDark () {
  /* --------------------------------------------------------------------------

                              CSS PROPERTIES

  -------------------------------------------------------------------------- */
  var cssProperties = {
    /* ------------------------------------------------------
                              COLORS
    ------------------------------------------------------ */
    colors: {
      // BASIC COLORS (B&W and transparent)
      transparent: 'transparent',
      white: 'hsla(198, 100%, 97%, 1)',
      black: 'hsla(240, 100%, 6%, 1)',
      opacityBlack: 'hsla(240, 100%, 6%, .7)',

      // BLUE
      blue: 'hsla(233, 91%, 36%, 1)',
      lightBlue: 'hsla(202, 91%, 75%, 1)',
      blueLightTrans: 'hsla(202, 91%, 75%, .4)',
      backgroundBlue: 'hsla(240, 100%, 21%, 1)',
      brightBlue: 'hsla(233, 91%, 58%, 1)',
      blueGreyEve: 'hsla(213, 64%, 65%, 1)',
      bluePruneEve: 'hsla(232, 30%, 20%, 1)',
      blueBerrySmog: 'hsla(286, 15%, 22%, 1)',
      blueBlur: 'hsla(232, 30%, 20%, 0.7)',
      blueMascara: 'hsla(187, 100%, 51%, 1)',
      blueMorningGlory: 'hsla(213, 74%, 80%, 1)',
      blueFairyDust: 'hsla(181, 83%, 86%, 1)',
      blueMonday: 'hsla(213, 100%, 16%, 1)',

      // GREY
      grey: 'hsla(0, 0%, 40%, 1)',
      lightGrey: 'hsla(0, 0%, 40%, .5)',
      veryLightGrey: 'hsla(0, 0%, 40%, .2)',

      blueGrey: 'hsla(206, 24%, 58%, .8)',
      greyBlueNight: 'hsla(215, 55%, 18%, 1)',
      greyBlueLight: 'hsla(213, 15%, 58%, 1)',
      greyBlueMed: 'hsla(215, 55%, 28%, 1)',

      desatGrey: 'hsla(173, 17%, 79%, 1)',
      // RED
      strongRed: 'hsla(0, 100%, 71%, 1)',
      red: 'hsla(0, 82%, 82%, 1)',
      lightRed: 'hsla(0, 82%, 82%, .8)',
      // GREEN
      green: 'hsla(141, 75%, 84%, 1)',
      lightGreen: 'hsla(141, 75%, 84%, .5)',
      greenZing: 'hsla(148, 79%, 47%, 1)',
      // PINK
      pink: 'hsla(300, 69%, 76%, 1)',
      lightPink: 'hsla(286, 71%, 88%, 1)',
      // YELLOW
      orange: 'hsla(39, 87%, 50%, 1)',
      lightOrange: 'hsla(39, 87%, 50%, .5)',
      // VIOLET
      violet: 'hsla(240, 64%, 68%, 1)',
      lightViolet: 'hsla(240, 64%, 68%, .5)'
    },

    /* ------------------------------------------------------
                              FONTS
    ------------------------------------------------------ */
    fonts: {
      font: '14px/1.5 Lato, "Helvetica Neue", Helvetica, Arial, sans-serif'
    },

    /* ------------------------------------------------------
                                  BORDERS
    ------------------------------------------------------ */
    borders: {
      primary_borderRadius: '3px',
      secondary_borderRadius: '5px'
    }
  }

  /* --------------------------------------------------------------------------

                                APP PROPERTIES

  -------------------------------------------------------------------------- */

  var appProperties = {

    /* ------------------------------------------------------
                          ACE THEME
    ------------------------------------------------------ */

    aceTheme: 'tomorrow_night_blue',

    /* ------------------------------------------------------
                          BACKGROUND COLORS
    ------------------------------------------------------ */
    primary_BackgroundColor: cssProperties.colors.black,
    secondary_BackgroundColor: cssProperties.colors.backgroundBlue,
    tertiary_BackgroundColor: cssProperties.colors.greyBlueNight,
    quaternary_BackgroundColor: cssProperties.colors.blueGreyEve,
    fifth_BackgroundColor: cssProperties.colors.bluePruneEve,
    seventh_BackgroundColor: cssProperties.colors.blueMonday,
    dark_BackgroundColor: cssProperties.colors.black,
    light_BackgroundColor: cssProperties.colors.white,
    debuggingMode_BackgroundColor: cssProperties.colors.lightViolet,
    highlight_BackgroundColor: cssProperties.colors.greyBlueMed,
    /* ------------------------------------------------------
                              RESIZING
    ******************************************************** */
    ghostBar: cssProperties.colors.blueLightTrans,
    draggingBar: cssProperties.colors.blueGreyEve,

    /* ------------------------------------------------------
                            TEXT COLORS
    ******************************************************** */
    mainText_Color: cssProperties.colors.white,
    supportText_Color: cssProperties.colors.lightBlue,
    sub_supportText_Color: cssProperties.colors.greyBlueLight,
    specialText_Color: cssProperties.colors.greenZing,
    brightText_Color: cssProperties.colors.blueMascara,
    oppositeText_Color: cssProperties.colors.black,
    additionalText_Color: cssProperties.colors.desatGrey,
    errorText_Color: cssProperties.colors.strongRed,
    warningText_Color: cssProperties.colors.orange,
    infoText_Color: cssProperties.colors.violet,
    greyedText_color: cssProperties.colors.desatGrey,
    /* ------------------------------------------------------
                              ICONS
    ******************************************************** */
    icon_Color: cssProperties.colors.white,
    icon_AltColor: cssProperties.colors.black,
    icon_HoverColor: cssProperties.colors.orange,
    icon_ConstantColor: cssProperties.colors.black,

    /* ------------------------------------------------------
                            MESSAGES
    ******************************************************** */
    // Success
    success_TextColor: cssProperties.colors.black,
    success_BackgroundColor: cssProperties.colors.lightGreen,
    success_BorderColor: cssProperties.colors.green,

    // Danger
    danger_TextColor: cssProperties.colors.black,
    danger_BackgroundColor: cssProperties.colors.lightRed,
    danger_BorderColor: cssProperties.colors.red,

    // Warning
    warning_TextColor: cssProperties.colors.black,
    warning_BackgroundColor: cssProperties.colors.orange,
    warning_BorderColor: cssProperties.colors.orange,

    // Tooltip
    tooltip_Color: cssProperties.colors.white,
    tooltip_BackgroundColor: cssProperties.colors.grey,
    tooltip_BorderColor: cssProperties.colors.grey,

    /* ------------------------------------------------------
                          DROPDOWN
    ******************************************************** */
    dropdown_TextColor: cssProperties.colors.black,
    dropdown_BackgroundColor: cssProperties.colors.white,
    dropdown_SecondaryBackgroundColor: cssProperties.colors.blueMorningGlory,
    dropdown_BorderColor: cssProperties.colors.veryLightGrey,

    /* ------------------------------------------------------
                            INPUT
    ******************************************************** */
    input_TextColor: cssProperties.colors.black,
    input_BackgroundColor: cssProperties.colors.white,
    input_BorderColor: cssProperties.colors.veryLightGrey,

    /* ------------------------------------------------------
                      SOLID BORDER BOX
    ******************************************************** */
    solidBorderBox_TextColor: cssProperties.colors.white,
    solidBorderBox_BackgroundColor: cssProperties.colors.black,
    solidBorderBox_BorderColor: cssProperties.colors.lightBlue,

    /* ------------------------------------------------------
                      SOLID BOX
    ******************************************************** */
    solidBox_TextColor: cssProperties.colors.white,
    solidBox_BackgroundColor: cssProperties.colors.black,

    /* ------------------------------------------------------
                          BUTTONS
    ******************************************************** */

    /* .................
          PRIMARY
    .................. */
    primaryButton_TextColor: cssProperties.colors.black,
    primaryButton_BackgroundColor: cssProperties.colors.lightBlue,
    primaryButton_BorderColor: cssProperties.colors.lightBlue,

    /* .................
          SECONDARY
    .................. */
    secondaryButton_TextColor: cssProperties.colors.black,
    secondaryButton_BackgroundColor: cssProperties.colors.lightBlue,
    secondaryButton_BorderColor: cssProperties.colors.veryLightGrey,

    /* .................
          Teriary
    .................. */
    teriaryButton_TextColor: cssProperties.colors.white,
    teriaryButton_BackgroundColor: cssProperties.colors.greyBlueMed,
    teriaryButton_BorderColor: cssProperties.colors.veryLightGrey,
    /* .................

    /* .................
          Quaternary
    .................. */
    quaternaryButton_TextColor: cssProperties.colors.black,
    quaternaryButton_BackgroundColor: cssProperties.colors.blueMascara,
    quaternaryButton_BorderColor: cssProperties.colors.veryLightGrey,
    /* .................

    /* .................
          Fifth
    .................. */
    fifthButton_TextColor: cssProperties.colors.black,
    fifthButton_BackgroundColor: cssProperties.colors.blueFairyDust,
    fifthButton_BorderColor: cssProperties.colors.veryLightGrey,
    /* .................

    /* .................
          Sixth
    .................. */
    sixthButton_TextColor: cssProperties.colors.black,
    sixthButton_BackgroundColor: cssProperties.colors.greenZing,
    sixthButton_BorderColor: cssProperties.colors.veryLightGrey,
    /* .................

          SUCCESS
    .................. */
    successButton_TextColor: cssProperties.colors.white,
    successButton_BackgroundColor: cssProperties.colors.green,
    successButton_BorderColor: cssProperties.colors.green,

    /* .................
          DANGER
    .................. */
    dangerButton_TextColor: cssProperties.colors.white,
    dangerButton_BackgroundColor: cssProperties.colors.red,
    dangerButton_BorderColor: cssProperties.colors.red,

    /* .................
          WARNING
    .................. */
    warningButton_TextColor: cssProperties.colors.white,
    warningButton_BackgroundColor: cssProperties.colors.lightOrange,
    warningButton_BorderColor: cssProperties.colors.lightOrange,

    /* .................
          INFO
    .................. */
    infoButton_TextColor: cssProperties.colors.black,
    infoButton_BackgroundColor: cssProperties.colors.lightPink,
    infoButton_BorderColor: cssProperties.colors.veryLightGrey,

    /* .................
          SOLIDITY
    .................. */

    // CALL
    callButton_TextColor: cssProperties.colors.black,
    callButton_BackgroundColor: cssProperties.colors.lightBlue,
    callButton_BorderColor: cssProperties.colors.lightBlue,

    // TRANSACTION
    transactButton_TextColor: cssProperties.colors.black,
    transactButton_BackgroundColor: cssProperties.colors.blueFairyDust,
    transactButton_BorderColor: cssProperties.colors.lightRed,

    // CONSTANT
    constantButton_TextColor: cssProperties.colors.black,
    constantButton_BackgroundColor: cssProperties.colors.greenZing,
    constantButton_BorderColor: cssProperties.colors.greenZing,

    // PAYABLE TRANSACTION
    transactPayableButton_TextColor: cssProperties.colors.black,
    transactPayableButton_BackgroundColor: cssProperties.colors.red,
    transactPayableButton_BorderColor: cssProperties.colors.red,

    /* ------------------------------------------------------
                            UI ELEMENTS
    ******************************************************** */

    uiElements: {
      solidBorderBox: (opts = {}) => `
        background-color      : ${opts.BackgroundColor};
        border                : 1px solid ${opts.BorderColor};
        color                 : ${opts.Color};
        border-radius         : ${cssProperties.borders.primary_borderRadius};
        font-size             : 12px;
        padding               : 10px 15px;
        line-height           : 20px;
        overflow              : hidden;
        word-break            : break-word;
        width                 : 100%;
      `,

      solidBox: (opts = {}) => `
        background-color      : ${opts.BackgroundColor};
        color                 : ${opts.Color};
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
        border-radius         : ${cssProperties.borders.secondary_borderRadius};
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
        border-radius         : ${cssProperties.borders.secondary_borderRadius};
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

  var remixProperties = {
    /* ------------------------------------------------------
                            REMIX GENERAL
    /* ------------------------------------------------------ */
    remix: {
      modalDialog_BackgroundColor_Primary: appProperties.fifth_BackgroundColor,
      modalDialog_text_Primary: appProperties.additionalText_Color,
      modalDialog_text_Secondary: appProperties.supportText_Color,
      modalDialog_text_Link: appProperties.brightText_Color,
      modalDialog_text_Em: appProperties.specialText_Color,
      modalDialog_Header_Footer_BackgroundColor: appProperties.secondary_BackgroundColor,
      modalDialog_Header_Footer_Color: appProperties.mainText_Color,
      modalDialog_BoxDottedBorder_BackgroundColor: appProperties.solidBorderBox_BackgroundColor,
      modalDialog_BoxDottedBorder_BorderColor: appProperties.solidBorderBox_BorderColor,
      modalDialog_BoxDottedBorder_Color: appProperties.solidBorderBox_TextColor,

      tooltip_CopyToClipboard_BackgroundColor: appProperties.tooltip_BackgroundColor,
      tooltip_CopyToClipboard_Color: appProperties.tooltip_Color,

      icon_Color_CopyToClipboard: appProperties.icon_Color,
      icon_HoverColor_CopyToClipboard: appProperties.icon_HoverColor
    },

    /* ------------------------------------------------------
                    LEFT PANEL (FILE PANEL)
    /* ------------------------------------------------------ */
    leftPanel: {
      backgroundColor_Panel: appProperties.primary_BackgroundColor,
      backgroundColor_FileExplorer: appProperties.tertiary_BackgroundColor,

      text_Primary: appProperties.mainText_Color,
      text_Secondary: appProperties.supportText_Color,
      text_Teriary: appProperties.sub_supportText_Color,

      bar_Ghost: appProperties.ghostBar,
      bar_Dragging: appProperties.draggingBar,

      icon_Color_Menu: appProperties.icon_Color,
      icon_HoverColor_Menu: appProperties.icon_HoverColor,

      icon_Color_TogglePanel: appProperties.icon_Color,
      icon_HoverColor_TogglePanel: appProperties.icon_HoverColor

    },

    /* ------------------------------------------------------
                              EDITOR
    /* ------------------------------------------------------ */
    editor: {
      backgroundColor_Panel: appProperties.primary_BackgroundColor,
      backgroundColor_Editor: appProperties.light_BackgroundColor,
      backgroundColor_Tabs_Highlights: appProperties.secondary_BackgroundColor,
      backgroundColor_Editor_Context_Highlights: appProperties.dark_BackgroundColor,
      backgroundColor_Editor_Context_Error_Highlights: appProperties.error_BackgroundColor,
      backgroundColor_DebuggerMode: appProperties.debuggingMode_BackgroundColor,

      text_Primary: appProperties.mainText_Color,
      text_Secondary: appProperties.supportText_Color,
      text_Teriary: appProperties.sub_supportText_Color,
      text_Editor: '',

      icon_Color_Editor: appProperties.icon_Color,
      icon_HoverColor_Editor: appProperties.icon_HoverColor

    },

    /* ------------------------------------------------------
                          TERMINAL
    /* ------------------------------------------------------ */
    terminal: {
      backgroundColor_Menu: appProperties.secondary_BackgroundColor,
      backgroundColor_Terminal: appProperties.seventh_BackgroundColor,
      backgroundColor_TerminalCLI: appProperties.seventh_BackgroundColor,
      backgroundImage_Terminal: "url('data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0idXRmLTgiPz4NCjwhLS0gR2VuZXJhdG9yOiBBZG9iZSBJbGx1c3RyYXRvciAxNi4wLjAsIFNWRyBFeHBvcnQgUGx1Zy1JbiAuIFNWRyBWZXJzaW9uOiA2LjAwIEJ1aWxkIDApICAtLT4NCjwhRE9DVFlQRSBzdmcgUFVCTElDICItLy9XM0MvL0RURCBTVkcgMS4xLy9FTiIgImh0dHA6Ly93d3cudzMub3JnL0dyYXBoaWNzL1NWRy8xLjEvRFREL3N2ZzExLmR0ZCI+DQo8c3ZnIHZlcnNpb249IjEuMSIgaWQ9IkxheWVyXzEiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgeG1sbnM6eGxpbms9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkveGxpbmsiIHg9IjBweCIgeT0iMHB4Ig0KCSB3aWR0aD0iNTEycHgiIGhlaWdodD0iNTEycHgiIHZpZXdCb3g9IjAgMCA1MTIgNTEyIiBlbmFibGUtYmFja2dyb3VuZD0ibmV3IDAgMCA1MTIgNTEyIiB4bWw6c3BhY2U9InByZXNlcnZlIj4NCgk8ZyBvcGFjaXR5PSIwLjEiPg0KCQk8Zz4NCgkJCTxwYXRoIGZpbGw9IiNGRkZGRkYiIGQ9Ik03MC41ODIsNDI4LjkwNGMwLjgxMSwwLDEuNjIyLDAuMjg1LDIuNDM3LDAuODU0YzAuODEyLDAuNTcsMS4yMTgsMS4zNCwxLjIxOCwyLjMxMw0KCQkJCWMwLDIuMjc3LTEuMDU5LDMuNDk2LTMuMTY4LDMuNjU2Yy01LjAzOCwwLjgxMy05LjM4MSwyLjM1NS0xMy4wMzYsNC42M2MtMy42NTUsMi4yNzYtNi42NjMsNS4xMTctOS4wMTcsOC41MjgNCgkJCQljLTIuMzU2LDMuNDExLTQuMTA0LDcuMjcxLTUuMjM5LDExLjU3NWMtMS4xMzksNC4zMDctMS43MDYsOC44MTMtMS43MDYsMTMuNTIzdjMyLjY1M2MwLDIuMjcyLTEuMTM5LDMuNDExLTMuNDExLDMuNDExDQoJCQkJYy0yLjI3NywwLTMuNDEyLTEuMTM5LTMuNDEyLTMuNDExdi03NC4zMjNjMC0yLjI3MywxLjEzNS0zLjQxMSwzLjQxMi0zLjQxMWMyLjI3MiwwLDMuNDExLDEuMTM4LDMuNDExLDMuNDExdjE1LjEwOA0KCQkJCWMxLjQ2My0yLjQzOCwzLjIwNi00Ljc1Miw1LjIzOS02Ljk0NWMyLjAyOS0yLjE5Myw0LjI2NS00LjE0Myw2LjcwMS01Ljg0OGMyLjQzNy0xLjcwNiw1LjA3Ni0zLjA4NSw3LjkxOS00LjE0NA0KCQkJCUM2NC43NzEsNDI5LjQzMyw2Ny42NTgsNDI4LjkwNCw3MC41ODIsNDI4LjkwNHoiLz4NCgkJCTxwYXRoIGZpbGw9IiNGRkZGRkYiIGQ9Ik0xMzcuNzczLDQyNy4xOThjNS42ODYsMCwxMC45NjYsMS4xODIsMTUuODM5LDMuNTM0YzQuODc0LDIuMzU2LDkuMDU2LDUuNDgyLDEyLjU1MSw5LjM4MQ0KCQkJCWMzLjQ5MSwzLjg5OSw2LjIxNCw4LjQwNyw4LjE2NCwxMy41MjRjMS45NDgsNS4xMTcsMi45MjQsMTAuNDM5LDIuOTI0LDE1Ljk2MWMwLDAuOTc2LTAuMzY2LDEuNzktMS4wOTgsMi40MzgNCgkJCQljLTAuNzMsMC42NS0xLjU4MywwLjk3Ni0yLjU1OSwwLjk3NmgtNjcuOTg3YzAuNDg3LDQuMjI2LDEuNTg0LDguMjg1LDMuMjksMTIuMTg0YzEuNzA2LDMuODk5LDMuOTM4LDcuMzEyLDYuNzAxLDEwLjIzNA0KCQkJCWMyLjc2MSwyLjkyNSw2LjAwOCw1LjI4MSw5Ljc0OCw3LjA2NmMzLjczNSwxLjc4OSw3Ljg3NywyLjY4MiwxMi40MjgsMi42ODJjMTIuMDIxLDAsMjEuMzYtNC43OSwyOC4wMjMtMTQuMzc3DQoJCQkJYzAuNjQ2LTEuMTM3LDEuNjIyLTEuNzA2LDIuOTI0LTEuNzA2YzIuMjczLDAsMy40MTIsMS4xMzksMy40MTIsMy40MTJjMCwwLjE2My0wLjE2NCwwLjcyOS0wLjQ4NywxLjcwNA0KCQkJCWMtMy40MTIsNi4wMTQtOC4yMDUsMTAuNDc5LTE0LjM3NywxMy40MDJjLTYuMTc2LDIuOTI0LTEyLjY3MSw0LjM4Ny0xOS40OTUsNC4zODdjLTUuNjg4LDAtMTAuOTI4LTEuMTgxLTE1LjcxOC0zLjUzMg0KCQkJCWMtNC43OTMtMi4zNTQtOC45MzYtNS40ODMtMTIuNDI4LTkuMzgyYy0zLjQ5NS0zLjg5OS02LjIxNC04LjQwNy04LjE2My0xMy41MjRjLTEuOTUtNS4xMTgtMi45MjQtMTAuNDM4LTIuOTI0LTE1Ljk2Mg0KCQkJCWMwLTUuNTIxLDAuOTc1LTEwLjg0NCwyLjkyNC0xNS45NjFzNC42NjgtOS42MjUsOC4xNjMtMTMuNTI0YzMuNDkyLTMuODk3LDcuNjM0LTcuMDIzLDEyLjQyOC05LjM4MQ0KCQkJCUMxMjYuODQ2LDQyOC4zOCwxMzIuMDg0LDQyNy4xOTgsMTM3Ljc3Myw0MjcuMTk4eiBNMTY5Ljk0LDQ2Ni4xODhjLTAuMzI4LTQuMjIzLTEuMzQxLTguMjg1LTMuMDQ2LTEyLjE4NA0KCQkJCWMtMS43MDYtMy44OTktMy45ODEtNy4zMTItNi44MjMtMTAuMjM1Yy0yLjg0NC0yLjkyNC02LjE3NS01LjI3Ny05Ljk5LTcuMDY3Yy0zLjgxOS0xLjc4NC03LjkyLTIuNjgtMTIuMzA3LTIuNjgNCgkJCQljLTQuNTUsMC04LjY5MSwwLjg5Ni0xMi40MjgsMi42OGMtMy43MzksMS43OS02Ljk4Nyw0LjE0NS05Ljc0OCw3LjA2N2MtMi43NjQsMi45MjQtNC45OTUsNi4zMzYtNi43MDEsMTAuMjM1DQoJCQkJYy0xLjcwNiwzLjg5Ny0yLjgwMiw3Ljk2MS0zLjI5LDEyLjE4NEgxNjkuOTR6Ii8+DQoJCQk8cGF0aCBmaWxsPSIjRkZGRkZGIiBkPSJNMzA0LjY5LDQyNy40NDFjNS4wMzQsMCw5LjUwNCwxLjAxOSwxMy40MDIsMy4wNDdjMy44OTksMi4wMzMsNy4xODgsNC42NzIsOS44Nyw3LjkyDQoJCQkJYzIuNjgsMy4yNTEsNC43MDksNy4wNjYsNi4wOTIsMTEuNDUyYzEuMzc5LDQuMzg3LDIuMDcsOC44NTYsMi4wNywxMy40MDJ2NDMuNjJjMCwwLjk3NS0wLjM2NSwxLjc4OS0xLjA5OCwyLjQzOA0KCQkJCWMtMC43MjksMC42NDYtMS41MDMsMC45NzYtMi4zMTIsMC45NzZjLTIuMjc2LDAtMy40MTItMS4xNDEtMy40MTItMy40MTJ2LTQzLjYyYzAtMy41NzEtMC41MjktNy4xMDQtMS41ODQtMTAuNjAxDQoJCQkJYy0xLjA1OS0zLjQ5LTIuNjAyLTYuNjE3LTQuNjMtOS4zODJjLTIuMDMzLTIuNzYxLTQuNTkyLTQuOTUzLTcuNjc3LTYuNThjLTMuMDg4LTEuNjIxLTYuNjYyLTIuNDM2LTEwLjcyMy0yLjQzNg0KCQkJCWMtNS4yLDAtOS41ODcsMS4yMTgtMTMuMTU5LDMuNjU0Yy0zLjU3MywyLjQzOC02LjQ1Niw1LjU2NS04LjY0OSw5LjM4MmMtMi4xOTMsMy44MTgtMy44MTgsOC4wNDItNC44NzQsMTIuNjcyDQoJCQkJYy0xLjA1OSw0LjYzLTEuNTg0LDkuMDU4LTEuNTg0LDEzLjI4djMzLjYyOWMwLDAuOTc1LTAuMzY1LDEuNzg5LTEuMDk2LDIuNDM4Yy0wLjczMSwwLjY0Ni0xLjUwNiwwLjk3Ni0yLjMxNSwwLjk3Ng0KCQkJCWMtMi4yNzYsMC0zLjQxMS0xLjE0MS0zLjQxMS0zLjQxMnYtNDMuNjJjMC0zLjU3MS0wLjUzLTcuMTA0LTEuNTg1LTEwLjYwMWMtMS4wNTgtMy40OS0yLjYwMS02LjYxNy00LjYyOS05LjM4Mg0KCQkJCWMtMi4wMzQtMi43NjEtNC41OTItNC45NTMtNy42NzctNi41OGMtMy4wODctMS42MjEtNi42NjMtMi40MzYtMTAuNzIzLTIuNDM2Yy01LjAzNiwwLTkuMzQ0LDAuODk1LTEyLjkxNSwyLjY4DQoJCQkJYy0zLjU3NCwxLjc5LTYuNTQyLDQuMjY3LTguODk1LDcuNDM0Yy0yLjM1NywzLjE2Ny00LjA2Myw2Ljk0My01LjExNywxMS4zMzFjLTEuMDU5LDQuMzg2LTEuNTg0LDkuMS0xLjU4NCwxNC4xMzR2My44OTh2MC4yNDMNCgkJCQl2MzIuODk3YzAsMi4yNzEtMS4xMzgsMy40MTItMy40MTIsMy40MTJjLTIuMjc1LDAtMy40MTEtMS4xNDEtMy40MTEtMy40MTJ2LTc0LjU2N2MwLTIuMjcyLDEuMTM2LTMuNDExLDMuNDExLTMuNDExDQoJCQkJYzIuMjczLDAsMy40MTIsMS4xMzksMy40MTIsMy40MTF2MTIuNDI4YzIuOTI0LTUuMTk2LDYuODYxLTkuMzgyLDExLjgxOS0xMi41NWM0Ljk1NC0zLjE2NywxMC41MTctNC43NTIsMTYuNjkxLTQuNzUyDQoJCQkJYzYuOTgzLDAsMTIuOTk1LDEuOTkxLDE4LjAzMiw1Ljk3YzUuMDMzLDMuOTgzLDguNjg4LDkuMjI0LDEwLjk2NiwxNS43MmMyLjc2MS02LjMzNiw2LjczOS0xMS41MzMsMTEuOTQtMTUuNTk3DQoJCQkJQzI5MS4xMjUsNDI5LjQ3NSwyOTcuMzgsNDI3LjQ0MSwzMDQuNjksNDI3LjQ0MXoiLz4NCgkJCTxwYXRoIGZpbGw9IiNGRkZGRkYiIGQ9Ik0zNzguNzUzLDQyOS4zOTJjMC44MTEsMCwxLjU4NCwwLjM2NSwyLjMxMywxLjA5N2MwLjczMSwwLjczLDEuMDk4LDEuNTA0LDEuMDk4LDIuMzE0djc0LjA4DQoJCQkJYzAsMC44MTMtMC4zNjUsMS41ODQtMS4wOTgsMi4zMTRjLTAuNzI5LDAuNzMtMS41MDQsMS4wOTgtMi4zMTMsMS4wOThjLTAuOTc2LDAtMS43OS0wLjM2Ni0yLjQzOC0xLjA5OA0KCQkJCWMtMC42NDktMC43My0wLjk3NS0xLjUwMS0wLjk3NS0yLjMxNHYtNzQuMDhjMC0wLjgxMiwwLjMyNC0xLjU4NCwwLjk3NS0yLjMxNEMzNzYuOTYzLDQyOS43NTgsMzc3Ljc3OCw0MjkuMzkyLDM3OC43NTMsNDI5LjM5MnoiDQoJCQkJLz4NCgkJCTxwYXRoIGZpbGw9IiNGRkZGRkYiIGQ9Ik00NzMuMzQsNDI4LjY2YzIuMjcyLDAsMy40MTIsMS4xNCwzLjQxMiwzLjQxMWwtMC40ODcsMS45NWwtMjQuMzY4LDM1LjMzNGwyNC4zNjgsMzUuNTc3DQoJCQkJYzAuMzIzLDAuOTc2LDAuNDg3LDEuNjI2LDAuNDg3LDEuOTVjMCwyLjI3MS0xLjE0LDMuNDEyLTMuNDEyLDMuNDEyYy0xLjMwMywwLTIuMTkzLTAuNDg4LTIuNjgxLTEuNDY0bC0yMi45MDUtMzMuMzg0DQoJCQkJbC0yMi42NjMsMzMuMzg0Yy0wLjgxNCwwLjk3Ni0xLjc5LDEuNDY0LTIuOTI1LDEuNDY0Yy0yLjI3NiwwLTMuNDEtMS4xNDEtMy40MS0zLjQxMmMwLTAuMzI0LDAuMTU4LTAuOTc2LDAuNDg1LTEuOTUNCgkJCQlsMjQuMzY5LTM1LjU3N2wtMjQuMzY5LTM1LjMzNGwtMC40ODUtMS45NWMwLTIuMjcxLDEuMTM0LTMuNDExLDMuNDEtMy40MTFjMS4xMzUsMCwyLjEwOSwwLjQ4NywyLjkyNSwxLjQ2MmwyMi42NjMsMzMuMTQyDQoJCQkJbDIyLjkwNS0zMy4xNDJDNDcxLjE0Niw0MjkuMTQ3LDQ3Mi4wMzcsNDI4LjY2LDQ3My4zNCw0MjguNjZ6Ii8+DQoJCTwvZz4NCgkJPGc+DQoJCQk8Zz4NCgkJCQk8ZyBvcGFjaXR5PSIwLjQ1Ij4NCgkJCQkJPGc+DQoJCQkJCQk8cG9seWdvbiBmaWxsPSIjRkZGRkZGIiBwb2ludHM9IjE1MC43MzQsMTk2LjIxMiAyNTUuOTY5LDM0NC41MDkgMjU1Ljk2OSwyNTguMzg3Ii8+DQoJCQkJCTwvZz4NCgkJCQk8L2c+DQoJCQkJPGcgb3BhY2l0eT0iMC44Ij4NCgkJCQkJPGc+DQoJCQkJCQk8cG9seWdvbiBmaWxsPSIjRkZGRkZGIiBwb2ludHM9IjI1NS45NjksMjU4LjM4NyAyNTUuOTY5LDM0NC41MDkgMzYxLjI2NywxOTYuMjEyIi8+DQoJCQkJCTwvZz4NCgkJCQk8L2c+DQoJCQkJPGcgb3BhY2l0eT0iMC42Ij4NCgkJCQkJPGc+DQoJCQkJCQk8cG9seWdvbiBmaWxsPSIjRkZGRkZGIiBwb2ludHM9IjI1NS45NjksMTI2Ljc4MSAxNTAuNzMzLDE3NC42MTEgMjU1Ljk2OSwyMzYuODE4IDM2MS4yMDQsMTc0LjYxMSIvPg0KCQkJCQk8L2c+DQoJCQkJPC9nPg0KCQkJCTxnIG9wYWNpdHk9IjAuNDUiPg0KCQkJCQk8Zz4NCgkJCQkJCTxwb2x5Z29uIGZpbGw9IiNGRkZGRkYiIHBvaW50cz0iMTUwLjczNCwxNzQuNjEyIDI1NS45NjksMjM2LjgxOCAyNTUuOTY5LDEyNi43ODIgMjU1Ljk2OSwwLjAwMSIvPg0KCQkJCQk8L2c+DQoJCQkJPC9nPg0KCQkJCTxnIG9wYWNpdHk9IjAuOCI+DQoJCQkJCTxnPg0KCQkJCQkJPHBvbHlnb24gZmlsbD0iI0ZGRkZGRiIgcG9pbnRzPSIyNTUuOTY5LDAgMjU1Ljk2OSwxMjYuNzgxIDI1NS45NjksMjM2LjgxOCAzNjEuMjA0LDE3NC42MTEiLz4NCgkJCQkJPC9nPg0KCQkJCTwvZz4NCgkJCTwvZz4NCgkJPC9nPg0KCTwvZz4NCjwvc3ZnPg0K')",

      text_Primary: appProperties.mainText_Color,
      text_Secondary: appProperties.supportText_Color,
      text_RegularLog: appProperties.mainText_Color,
      text_InfoLog: appProperties.supportText_Color,
      text_WarnLog: appProperties.warningText_Color,
      text_ErrorLog: appProperties.errorText_Color,
      text_Title_TransactionLog: appProperties.infoText_Color,
      text_Regular_TransactionLog: appProperties.supportText_Color,
      text_Button: appProperties.oppositeText_Color,

      icon_Color_TogglePanel: appProperties.icon_Color,
      icon_HoverColor_TogglePanel: appProperties.icon_HoverColor,
      icon_Color_Menu: appProperties.icon_Color,
      icon_HoverColor_Menu: appProperties.icon_HoverColor,

      bar_Ghost: appProperties.ghostBar,
      bar_Dragging: appProperties.draggingBar,

      input_Search_MenuBar: appProperties.uiElements.inputField({
        BackgroundColor: appProperties.input_BackgroundColor,
        BorderColor: appProperties.input_BorderColor,
        Color: appProperties.input_TextColor
      }),

      dropdown_Filter_MenuBar: appProperties.uiElements.dropdown({
        BackgroundColor: appProperties.dropdown_BackgroundColor,
        BorderColor: appProperties.dropdown_BorderColor,
        Color: appProperties.dropdown_TextColor
      }),

      button_Log_Debug: appProperties.uiElements.button({
        BackgroundColor: appProperties.quaternaryButton_BackgroundColor,
        BorderColor: appProperties.infoButton_BorderColor,
        Color: appProperties.infoButton_TextColor
      }),

      button_Log_Details: appProperties.uiElements.button({
        BackgroundColor: appProperties.quaternaryButton_BackgroundColor,
        BorderColor: appProperties.quaternaryButton_BorderColor,
        Color: appProperties.quaternaryButton_TextColor
      })

    },

    /* ------------------------------------------------------
                              RIGHT PANEL
    /* ------------------------------------------------------ */
    rightPanel: {
      backgroundColor_Panel: appProperties.seventh_BackgroundColor,
      backgroundColor_Tab: appProperties.seventh_BackgroundColor,
      BackgroundColor_Pre: appProperties.dark_BackgroundColor,

      text_Primary: appProperties.mainText_Color,
      text_Secondary: appProperties.supportText_Color,
      text_Teriary: appProperties.sub_supportText_Color,
      text_link: appProperties.brightText_Color,

      bar_Ghost: appProperties.ghostBar,
      bar_Dragging: appProperties.draggingBar,

      icon_Color_TogglePanel: appProperties.icon_Color,
      icon_HoverColor_TogglePanel: appProperties.icon_HoverColor,

      message_Warning_BackgroundColor: appProperties.warning_BackgroundColor,
      message_Warning_BorderColor: appProperties.warning_BorderColor,
      message_Warning_Color: appProperties.warning_TextColor,

      message_Error_BackgroundColor: appProperties.danger_BackgroundColor,
      message_Error_BorderColor: appProperties.danger_BorderColor,
      message_Error_Color: appProperties.danger_TextColor,

      message_Success_BackgroundColor: appProperties.success_BackgroundColor,
      message_Success_BorderColor: appProperties.success_BorderColor,
      message_Success_Color: appProperties.success_TextColor,

      /* ::::::::::::::
          COMPILE TAB
      ::::::::::::::: */
      compileTab: {
        button_Compile: appProperties.uiElements.button({
          BackgroundColor: appProperties.primaryButton_BackgroundColor,
          BorderColor: appProperties.primaryButton_BorderColor,
          Color: appProperties.primaryButton_TextColor
        }),

        button_Details: appProperties.uiElements.button({
          BackgroundColor: appProperties.secondaryButton_BackgroundColor,
          BorderColor: appProperties.secondaryButton_BorderColor,
          Color: appProperties.secondaryButton_TextColor
        }),

        button_Publish: appProperties.uiElements.button({
          BackgroundColor: appProperties.secondaryButton_BackgroundColor,
          BorderColor: appProperties.secondaryButton_BorderColor,
          Color: appProperties.secondaryButton_TextColor
        }),

        dropdown_CompileContract: appProperties.uiElements.dropdown({
          BackgroundColor: appProperties.dropdown_BackgroundColor,
          BorderColor: appProperties.dropdown_BorderColor,
          Color: appProperties.dropdown_TextColor
        }),

        box_CompileContainer: appProperties.uiElements.solidBorderBox({
          BackgroundColor: appProperties.quaternary_BackgroundColor,
          BorderColor: appProperties.solidBorderBox_BackgroundColor,
          Color: appProperties.solidBorderBox_TextColor
        }),

        icon_WarnCompilation_Color: appProperties.warning_BackgroundColor

      },

      /* ::::::::::::::
          RUN TAB
      ::::::::::::::: */
      runTab: {
        box_RunTab: appProperties.uiElements.solidBorderBox({
          BackgroundColor: appProperties.solidBox_BackgroundColor,
          Color: appProperties.solidBox_TextColor
        }),

        dropdown_RunTab: appProperties.uiElements.dropdown({
          BackgroundColor: appProperties.dropdown_BackgroundColor,
          BorderColor: appProperties.dropdown_BorderColor,
          Color: appProperties.dropdown_TextColor
        }),
        titlebox_RunTab: appProperties.uiElements.dropdown({
          BackgroundColor: appProperties.dropdown_SecondaryBackgroundColor,
          BorderColor: appProperties.dropdown_BorderColor,
          Color: appProperties.dropdown_TextColor
        }),

        input_RunTab: appProperties.uiElements.inputField({
          BackgroundColor: appProperties.input_BackgroundColor,
          BorderColor: appProperties.input_BorderColor,
          Color: appProperties.input_TextColor
        }),

        box_Instance: appProperties.uiElements.solidBox({
          BackgroundColor: appProperties.solidBox_BackgroundColor,
          Color: appProperties.solidBox_TextColor
        }),

        borderBox_Instance: appProperties.uiElements.solidBorderBox({
          BackgroundColor: appProperties.solidBox_BackgroundColor,
          Color: appProperties.solidBox_TextColor,
          BorderColor: appProperties.solidBorderBox_BorderColor
        }),

        button_atAddress: appProperties.uiElements.button({
          BackgroundColor: appProperties.primaryButton_BackgroundColor,
          BorderColor: appProperties.primaryButton_BorderColor,
          Color: appProperties.primaryButton_TextColor
        }),
        button_Create: appProperties.uiElements.button({
          BackgroundColor: appProperties.transactButton_BackgroundColor,
          BorderColor: appProperties.transactButton_BorderColor,
          Color: appProperties.transactButton_TextColor
        }),
        button_Constant: appProperties.uiElements.button({
          BackgroundColor: appProperties.constantButton_BackgroundColor,
          BorderColor: appProperties.constantButton_BorderColor,
          Color: appProperties.constantButton_TextColor
        }),
        button_Instance_Call: appProperties.uiElements.button({
          BackgroundColor: appProperties.callButton_BackgroundColor,
          BorderColor: appProperties.callButton_BorderColor,
          Color: appProperties.callButton_TextColor
        }),
        button_Instance_Transact: appProperties.uiElements.button({
          BackgroundColor: appProperties.transactButton_BackgroundColor,
          BorderColor: appProperties.transactButton_BorderColor,
          Color: appProperties.transactButton_TextColor
        }),

        button_Instance_TransactPayable: appProperties.uiElements.button({
          BackgroundColor: appProperties.transactPayableButton_BackgroundColor,
          BorderColor: appProperties.transactPayableButton_BorderColor,
          Color: appProperties.transactPayableButton_TextColor
        }),

        icon_Color_Instance_CopyToClipboard: appProperties.icon_Color,
        icon_AltColor_Instance_CopyToClipboard: appProperties.icon_AltColor,
        icon_HoverColor_Instance_CopyToClipboard: appProperties.icon_HoverColor

      },

      /* ::::::::::::::
         TEST TAB
      ::::::::::::::: */
      testTab: {
        box_listTests: appProperties.uiElements.solidBorderBox({
          BackgroundColor: appProperties.solidBorderBox_BackgroundColor,
          BorderColor: appProperties.solidBorderBox_BackgroundColor,
          Color: appProperties.solidBorderBox_TextColor
        }),

        button_runTests: appProperties.uiElements.button({
          BackgroundColor: appProperties.primaryButton_BackgroundColor,
          BorderColor: appProperties.primaryButton_BorderColor,
          Color: appProperties.primaryButton_TextColor
        }),

        button_generateTestFile: appProperties.uiElements.button({
          BackgroundColor: appProperties.primaryButton_BackgroundColor,
          BorderColor: appProperties.primaryButton_BorderColor,
          Color: appProperties.primaryButton_TextColor
        }),

        color_testPass: appProperties.success_BackgroundColor,
        color_testFail: appProperties.danger_BackgroundColor
      },

      /* ::::::::::::::
         SETTINGS TAB
      ::::::::::::::: */
      settingsTab: {
        box_SolidityVersionInfo: appProperties.uiElements.dottedBorderBox({
          BackgroundColor: appProperties.solidBorderBox_BackgroundColor,
          BorderColor: appProperties.solidBorderBox_BorderColor,
          Color: appProperties.solidBorderBox_TextColor
        }),

        dropdown_SelectCompiler: appProperties.uiElements.dropdown({
          BackgroundColor: appProperties.dropdown_BackgroundColor,
          BorderColor: appProperties.dropdown_BorderColor,
          Color: appProperties.dropdown_TextColor
        }),

        button_LoadPlugin: appProperties.uiElements.button({
          BackgroundColor: appProperties.secondaryButton_BackgroundColor,
          BorderColor: appProperties.secondaryButton_BorderColor,
          Color: appProperties.secondaryButton_TextColor
        }),

        button_initPlugin: appProperties.uiElements.button({
          BackgroundColor: appProperties.transactButton_BackgroundColor,
          BorderColor: appProperties.transactButton_BorderColor,
          Color: appProperties.secondaryButton_TextColor
        })

      },

      /* ::::::::::::::
        DEBUGGER TAB
      ::::::::::::::: */
      debuggerTab: {
        text_Primary: appProperties.mainText_Color,
        text_Secondary: appProperties.supportText_Color,
        text_BgHighlight: appProperties.highlight_BackgroundColor,

        box_Debugger: appProperties.uiElements.solidBorderBox({
          BackgroundColor: appProperties.solidBorderBox_BackgroundColor,
          BorderColor: appProperties.solidBorderBox_BackgroundColor,
          Color: appProperties.solidBorderBox_TextColor
        }),

        button_Debugger: appProperties.uiElements.button({
          BackgroundColor: appProperties.teriaryButton_BackgroundColor,
          BorderColor: appProperties.secondaryButton_BorderColor,
          Color: appProperties.teriaryButton_TextColor
        }),

        button_Debugger_icon_Color: appProperties.icon_ConstantColor,
        button_Debugger_icon_HoverColor: appProperties.icon_HoverColor,

        dropdown_Debugger: appProperties.uiElements.dropdown({
          BackgroundColor: appProperties.dropdown_BackgroundColor,
          BorderColor: appProperties.dropdown_BorderColor,
          Color: appProperties.dropdown_TextColor
        }),

        input_Debugger: appProperties.uiElements.inputField({
          BackgroundColor: appProperties.input_BackgroundColor,
          BorderColor: appProperties.input_BorderColor,
          Color: appProperties.input_TextColor
        }),

        debuggerDropdowns_Instructions_Highlight_BackgroundColor: appProperties.secondary_BackgroundColor

      },

      /* ::::::::::::::
        ANALYSIS TAB
      ::::::::::::::: */
      analysisTab: {
        button_Run_AnalysisTab: appProperties.uiElements.button({
          BackgroundColor: appProperties.primaryButton_BackgroundColor,
          BorderColor: appProperties.primaryButton_BorderColor,
          Color: appProperties.primaryButton_TextColor
        }),

        box_AnalysisContainer: appProperties.uiElements.solidBorderBox({
          BackgroundColor: appProperties.solidBorderBox_BackgroundColor,
          BorderColor: appProperties.solidBorderBox_BackgroundColor,
          Color: appProperties.solidBorderBox_TextColor
        })
      },

      /* ::::::::::::::
        SUPPORT TAB
      ::::::::::::::: */
      supportTab: {
        box_IframeContainer: appProperties.uiElements.solidBorderBox({
          BackgroundColor: appProperties.solidBorderBox_BackgroundColor,
          BorderColor: appProperties.solidBorderBox_BackgroundColor,
          Color: appProperties.solidBorderBox_TextColor
        }),

        box_SupportInfo: appProperties.uiElements.dottedBorderBox({
          BackgroundColor: appProperties.solidBorderBox_BackgroundColor,
          BorderColor: appProperties.solidBorderBox_BorderColor,
          Color: appProperties.solidBorderBox_TextColor
        })

      }

    }
  }

  return {
    colors: cssProperties.colors,
    appProperties: appProperties,
    borders: cssProperties.borders,
    leftPanel: remixProperties.leftPanel,
    editor: remixProperties.editor,
    terminal: remixProperties.terminal,
    rightPanel: remixProperties.rightPanel,
    remix: remixProperties.remix
  }
}
