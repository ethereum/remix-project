// var csjs = require('csjs-inject')

module.exports = styleGuideClean

function styleGuideClean () {
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
      white: 'hsl(0, 0%, 100%)',
      black: 'black',
      opacityBlack: 'hsla(0, 0%, 0%, .4)',

      // BLUE
      blue: 'hsla(229, 75%, 87%, 1)',
      lightBlue: 'hsla(229, 75%, 87%, .5)',
      backgroundBlue: 'hsla(229, 100%, 97%, 1)',
      brightBlue: 'hsla(233, 91%, 58%, 1)',
      azure: '#dbe9f4',
      // GREY
      grey: 'hsla(0, 0%, 40%, 1)',
      lightGrey: 'hsla(0, 0%, 40%, .5)',
      veryLightGrey: 'hsla(0, 0%, 40%, .2)',
      // RED
      strongRed: 'hsla(0, 100%, 71%, 1)',
      red: 'hsla(0, 82%, 82%, 1)',
      lightRed: 'hsla(0, 82%, 82%, .5)',
      // GREEN
      green: 'hsla(141, 75%, 84%, 1)',
      lightGreen: 'hsla(141, 75%, 84%, .5)',
      greenZing: 'hsla(148, 79%, 47%, 1)',
      // PINK
      pink: 'hsla(300, 69%, 76%, 1)',
      lightPink: 'hsla(300, 69%, 76%, .5)',
      // ORANGE
      orange: 'hsla(44, 100%, 50%, 1)',
      lightOrange: 'hsla(44, 100%, 50%, .5)',
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

    aceTheme: '',

    /* ------------------------------------------------------
                          BACKGROUND COLORS
    ------------------------------------------------------ */
    primary_BackgroundColor: cssProperties.colors.white,
    secondary_BackgroundColor: cssProperties.colors.white,
    tertiary_BackgroundColor: cssProperties.colors.white,
    quaternary_BackgroundColor: cssProperties.colors.white,
    fifth_BackgroundColor: cssProperties.colors.white,
    seventh_BackgroundColor: cssProperties.colors.white,
    dark_BackgroundColor: cssProperties.colors.black,
    light_BackgroundColor: cssProperties.colors.white,
    debuggingMode_BackgroundColor: cssProperties.colors.veryLightGrey,
    highlight_BackgroundColor: cssProperties.colors.veryLightGrey,
    /* ------------------------------------------------------
                              RESIZING
    ******************************************************** */
    ghostBar: cssProperties.colors.veryLightGrey,
    draggingBar: cssProperties.colors.veryLightGrey,

    /* ------------------------------------------------------
                            TEXT COLORS
    ******************************************************** */
    mainText_Color: cssProperties.colors.black,
    supportText_Color: cssProperties.colors.grey,

    sub_supportText_Color: cssProperties.colors.black,
    specialText_Color: cssProperties.colors.greenZing,
    brightText_Color: cssProperties.colors.brightBlue,
    oppositeText_Color: cssProperties.colors.black,
    additionalText_Color: cssProperties.colors.veryLightGrey,

    errorText_Color: cssProperties.colors.strongRed,
    warningText_Color: cssProperties.colors.orange,
    infoText_Color: cssProperties.colors.violet,
    greyedText_color: cssProperties.colors.veryLightGrey,
    /* ------------------------------------------------------
                              ICONS
    ******************************************************** */
    icon_Color: cssProperties.colors.black,
    icon_AltColor: cssProperties.colors.white,
    icon_HoverColor: cssProperties.colors.grey,
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
    warning_BackgroundColor: cssProperties.colors.lightOrange,
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
    dropdown_SecondaryBackgroundColor: cssProperties.colors.white,
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
    solidBorderBox_TextColor: cssProperties.colors.black,
    solidBorderBox_BackgroundColor: cssProperties.colors.white,
    solidBorderBox_BorderColor: cssProperties.colors.white,

    /* ------------------------------------------------------
                      SOLID BOX
    ******************************************************** */
    solidBox_TextColor: cssProperties.colors.black,
    solidBox_BackgroundColor: cssProperties.colors.white,

    /* ------------------------------------------------------
                          BUTTONS
    ******************************************************** */

    /* .................
          PRIMARY
    .................. */
    primaryButton_TextColor: cssProperties.colors.black,
    primaryButton_BackgroundColor: cssProperties.colors.white,
    primaryButton_BorderColor: cssProperties.colors.black,
    primaryButton_BorderWidth: '1px',

    /* .................
          SECONDARY
    .................. */
    secondaryButton_TextColor: cssProperties.colors.black,
    secondaryButton_BackgroundColor: cssProperties.colors.white,
    secondaryButton_BorderColor: cssProperties.colors.black,

    /* .................
          Teriary
    .................. */
    teriaryButton_TextColor: cssProperties.colors.black,
    teriaryButton_BackgroundColor: cssProperties.colors.white,
    teriaryButton_BorderColor: cssProperties.colors.black,
    /* .................

    /* .................
          Quaternary
    .................. */
    quaternaryButton_TextColor: cssProperties.colors.black,
    quaternaryButton_BackgroundColor: cssProperties.colors.white,
    quaternaryButton_BorderColor: cssProperties.colors.black,
    /* .................

    /* .................
          Fifth
    .................. */
    fifthButton_TextColor: cssProperties.colors.black,
    fifthButton_BackgroundColor: cssProperties.colors.white,
    fifthButton_BorderColor: cssProperties.colors.black,
    /* .................

    /* .................
          Sixth
    .................. */
    sixthButton_TextColor: cssProperties.colors.black,
    sixthButton_BackgroundColor: cssProperties.colors.white,
    sixthButton_BorderColor: cssProperties.colors.black,
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
    infoButton_BackgroundColor: cssProperties.colors.white,
    infoButton_BorderColor: cssProperties.colors.black,

    /* .................
          SOLIDITY
    .................. */

    // CALL
    callButton_TextColor: cssProperties.colors.black,
    callButton_BackgroundColor: cssProperties.colors.lightBlue,
    callButton_BorderColor: cssProperties.colors.lightBlue,

    // TRANSACTION
    transactButton_TextColor: cssProperties.colors.black,
    transactButton_BackgroundColor: cssProperties.colors.lightRed,
    transactButton_BorderColor: cssProperties.colors.lightRed,

    // CONSTANT
    constantButton_TextColor: cssProperties.colors.black,
    constantButton_BackgroundColor: cssProperties.colors.lightBlue,
    constantButton_BorderColor: cssProperties.colors.lightBlue,

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
        border-radius         : ${cssProperties.borders.primary_borderRadius}
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
        width                   : 100%;
        text-align              : center;
        overflow                : hidden;
        word-break              : normal;
      `,

      button: (opts = {}) => `
        margin                  : 1px;
        background-color        : ${opts.BackgroundColor};
        color                   : ${opts.Color};
        border                  : 1px solid;
        display                 : flex;
        align-items             : center;
        justify-content         : center;
        cursor                  : pointer;
        min-height              : 25px;
        max-height              : 25px;
        width                   : 70px;
        min-width               : 70px;
        font-size               : 12px;
        overflow                : hidden;
        word-break              : normal;
        border-radius           : ${opts.BorderRadius};
        border-width            : ${opts.BorderWidth};
        border-color            : ${opts.BorderColor};
        border-style            : ${opts.BorderStyle};
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
      modalDialog_BackgroundColor_Primary: appProperties.primary_BackgroundColor,
      modalDialog_text_Primary: appProperties.mainText_Color,
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
      icon_HoverColor_CopyToClipboard: appProperties.icon_HoverColor,

      solidBox: appProperties.uiElements.solidBorderBox({
        BackgroundColor: appProperties.solidBox_BackgroundColor,
        Color: appProperties.solidBox_TextColor
      })
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
      dragbarBorderRight: '2px solid ' + cssProperties.colors.veryLightGrey,

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
      backgroundColor_Editor_Context_Highlights: appProperties.secondary_BackgroundColor,
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
      backgroundImage_Terminal: "url('data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0idXRmLTgiPz4NCjwhLS0gR2VuZXJhdG9yOiBBZG9iZSBJbGx1c3RyYXRvciAxNi4wLjAsIFNWRyBFeHBvcnQgUGx1Zy1JbiAuIFNWRyBWZXJzaW9uOiA2LjAwIEJ1aWxkIDApICAtLT4NCjwhRE9DVFlQRSBzdmcgUFVCTElDICItLy9XM0MvL0RURCBTVkcgMS4xLy9FTiIgImh0dHA6Ly93d3cudzMub3JnL0dyYXBoaWNzL1NWRy8xLjEvRFREL3N2ZzExLmR0ZCI+DQo8c3ZnIHZlcnNpb249IjEuMSIgaWQ9IkxheWVyXzEiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgeG1sbnM6eGxpbms9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkveGxpbmsiIHg9IjBweCIgeT0iMHB4Ig0KCSB3aWR0aD0iNTEycHgiIGhlaWdodD0iNTEycHgiIHZpZXdCb3g9IjAgMCA1MTIgNTEyIiBlbmFibGUtYmFja2dyb3VuZD0ibmV3IDAgMCA1MTIgNTEyIiB4bWw6c3BhY2U9InByZXNlcnZlIj4NCgk8ZyBvcGFjaXR5PSIwLjEiPg0KCQk8Zz4NCgkJCTxwYXRoIGZpbGw9IiM0MTQwNDIiIGQ9Ik03MC41ODIsNDI4LjkwNGMwLjgxMSwwLDEuNjIyLDAuMjg1LDIuNDM3LDAuODUzYzAuODExLDAuNTcxLDEuMjE4LDEuMzQsMS4yMTgsMi4zMTQNCgkJCQljMCwyLjI3Ny0xLjA1OSwzLjQ5Ni0zLjE2OCwzLjY1NmMtNS4wMzgsMC44MTQtOS4zODEsMi4zNTYtMTMuMDM3LDQuNjNjLTMuNjU1LDIuMjc2LTYuNjYzLDUuMTE3LTkuMDE2LDguNTI4DQoJCQkJYy0yLjM1NywzLjQxMS00LjEwNCw3LjI3Mi01LjIzOSwxMS41NzVjLTEuMTM5LDQuMzA3LTEuNzA2LDguODE0LTEuNzA2LDEzLjUyNHYzMi42NTNjMCwyLjI3My0xLjEzOSwzLjQxMS0zLjQxMiwzLjQxMQ0KCQkJCWMtMi4yNzcsMC0zLjQxMi0xLjEzOC0zLjQxMi0zLjQxMXYtNzQuMzIzYzAtMi4yNzMsMS4xMzUtMy40MTEsMy40MTItMy40MTFjMi4yNzMsMCwzLjQxMiwxLjEzOCwzLjQxMiwzLjQxMXYxNS4xMDgNCgkJCQljMS40NjItMi40MzcsMy4yMDYtNC43NTIsNS4yMzktNi45NDVjMi4wMjktMi4xOTMsNC4yNjQtNC4xNDMsNi43MDEtNS44NDhjMi40MzctMS43MDYsNS4wNzYtMy4wODUsNy45MTktNC4xNDMNCgkJCQlDNjQuNzcxLDQyOS40MzMsNjcuNjU4LDQyOC45MDQsNzAuNTgyLDQyOC45MDR6Ii8+DQoJCQk8cGF0aCBmaWxsPSIjNDE0MDQyIiBkPSJNMTM3Ljc3Myw0MjcuMTk4YzUuNjg1LDAsMTAuOTY2LDEuMTgxLDE1LjgzOSwzLjUzNGM0Ljg3NCwyLjM1Niw5LjA1NSw1LjQ4MiwxMi41NSw5LjM4MQ0KCQkJCWMzLjQ5MiwzLjg5OSw2LjIxNCw4LjQwNyw4LjE2NCwxMy41MjRjMS45NDksNS4xMTcsMi45MjQsMTAuNDQsMi45MjQsMTUuOTYxYzAsMC45NzYtMC4zNjYsMS43OS0xLjA5NywyLjQzOA0KCQkJCWMtMC43MzEsMC42NS0xLjU4MywwLjk3NS0yLjU1OSwwLjk3NWgtNjcuOTg3YzAuNDg3LDQuMjI2LDEuNTg0LDguMjg1LDMuMjksMTIuMTg0YzEuNzA2LDMuODk5LDMuOTM3LDcuMzEyLDYuNzAxLDEwLjIzNA0KCQkJCWMyLjc2MSwyLjkyNSw2LjAwOCw1LjI4MSw5Ljc0OCw3LjA2N2MzLjczNSwxLjc4OSw3Ljg3NywyLjY4MSwxMi40MjgsMi42ODFjMTIuMDIxLDAsMjEuMzYtNC43OSwyOC4wMjMtMTQuMzc3DQoJCQkJYzAuNjQ3LTEuMTM2LDEuNjIyLTEuNzA2LDIuOTI0LTEuNzA2YzIuMjczLDAsMy40MTIsMS4xMzksMy40MTIsMy40MTJjMCwwLjE2My0wLjE2NCwwLjczLTAuNDg3LDEuNzA1DQoJCQkJYy0zLjQxMiw2LjAxMy04LjIwNSwxMC40NzktMTQuMzc3LDEzLjQwMmMtNi4xNzYsMi45MjQtMTIuNjcxLDQuMzg3LTE5LjQ5NSw0LjM4N2MtNS42ODksMC0xMC45MjgtMS4xODEtMTUuNzE4LTMuNTMzDQoJCQkJYy00Ljc5My0yLjM1NC04LjkzNi01LjQ4My0xMi40MjgtOS4zODJjLTMuNDk1LTMuODk5LTYuMjE0LTguNDA3LTguMTYzLTEzLjUyNGMtMS45NS01LjExOC0yLjkyNC0xMC40MzctMi45MjQtMTUuOTYyDQoJCQkJYzAtNS41MjEsMC45NzUtMTAuODQ0LDIuOTI0LTE1Ljk2MWMxLjk0OS01LjExNyw0LjY2OC05LjYyNSw4LjE2My0xMy41MjRjMy40OTItMy44OTgsNy42MzQtNy4wMjQsMTIuNDI4LTkuMzgxDQoJCQkJQzEyNi44NDYsNDI4LjM3OSwxMzIuMDg0LDQyNy4xOTgsMTM3Ljc3Myw0MjcuMTk4eiBNMTY5Ljk0LDQ2Ni4xODhjLTAuMzI4LTQuMjIzLTEuMzQxLTguMjg1LTMuMDQ2LTEyLjE4NA0KCQkJCWMtMS43MDYtMy44OTktMy45ODItNy4zMTItNi44MjMtMTAuMjM1Yy0yLjg0NC0yLjkyNC02LjE3NS01LjI3Ny05Ljk5MS03LjA2N2MtMy44MTktMS43ODUtNy45Mi0yLjY4LTEyLjMwNi0yLjY4DQoJCQkJYy00LjU1LDAtOC42OTIsMC44OTUtMTIuNDI4LDIuNjhjLTMuNzM5LDEuNzktNi45ODcsNC4xNDQtOS43NDgsNy4wNjdjLTIuNzY0LDIuOTI0LTQuOTk1LDYuMzM2LTYuNzAxLDEwLjIzNQ0KCQkJCWMtMS43MDYsMy44OTgtMi44MDIsNy45NjEtMy4yOSwxMi4xODRIMTY5Ljk0eiIvPg0KCQkJPHBhdGggZmlsbD0iIzQxNDA0MiIgZD0iTTMwNC42OSw0MjcuNDQxYzUuMDM0LDAsOS41MDQsMS4wMTgsMTMuNDAyLDMuMDQ3YzMuODk5LDIuMDMzLDcuMTg5LDQuNjcyLDkuODcsNy45Mg0KCQkJCWMyLjY4LDMuMjUxLDQuNzA5LDcuMDY2LDYuMDkyLDExLjQ1MmMxLjM3OSw0LjM4NywyLjA3LDguODU2LDIuMDcsMTMuNDAydjQzLjYyYzAsMC45NzUtMC4zNjUsMS43ODktMS4wOTcsMi40MzgNCgkJCQljLTAuNzMsMC42NDYtMS41MDMsMC45NzUtMi4zMTMsMC45NzVjLTIuMjc2LDAtMy40MTItMS4xNC0zLjQxMi0zLjQxMnYtNDMuNjJjMC0zLjU3MS0wLjUyOS03LjEwNC0xLjU4NC0xMC42DQoJCQkJYy0xLjA1OS0zLjQ5MS0yLjYwMi02LjYxOC00LjYzLTkuMzgyYy0yLjAzMy0yLjc2MS00LjU5Mi00Ljk1My03LjY3Ny02LjU4Yy0zLjA4OC0xLjYyMS02LjY2Mi0yLjQzNi0xMC43MjItMi40MzYNCgkJCQljLTUuMiwwLTkuNTg3LDEuMjE4LTEzLjE1OSwzLjY1NGMtMy41NzQsMi40MzgtNi40NTcsNS41NjYtOC42NSw5LjM4MmMtMi4xOTMsMy44MTktMy44MTgsOC4wNDItNC44NzQsMTIuNjcyDQoJCQkJYy0xLjA1OSw0LjYzLTEuNTg0LDkuMDU4LTEuNTg0LDEzLjI4djMzLjYyOWMwLDAuOTc1LTAuMzY1LDEuNzg5LTEuMDk2LDIuNDM4Yy0wLjczMSwwLjY0Ni0xLjUwNSwwLjk3NS0yLjMxNSwwLjk3NQ0KCQkJCWMtMi4yNzYsMC0zLjQxMS0xLjE0LTMuNDExLTMuNDEydi00My42MmMwLTMuNTcxLTAuNTMtNy4xMDQtMS41ODUtMTAuNmMtMS4wNTgtMy40OTEtMi42MDEtNi42MTgtNC42MjktOS4zODINCgkJCQljLTIuMDM0LTIuNzYxLTQuNTkyLTQuOTUzLTcuNjc3LTYuNThjLTMuMDg3LTEuNjIxLTYuNjYzLTIuNDM2LTEwLjcyMi0yLjQzNmMtNS4wMzcsMC05LjM0NCwwLjg5NS0xMi45MTUsMi42OA0KCQkJCWMtMy41NzUsMS43OS02LjU0Miw0LjI2Ni04Ljg5NSw3LjQzM2MtMi4zNTcsMy4xNjctNC4wNjMsNi45NDQtNS4xMTcsMTEuMzMxYy0xLjA1OSw0LjM4Ni0xLjU4NCw5LjEtMS41ODQsMTQuMTM0djMuODk5djAuMjQzDQoJCQkJdjMyLjg5N2MwLDIuMjcyLTEuMTM4LDMuNDEyLTMuNDEyLDMuNDEyYy0yLjI3NiwwLTMuNDExLTEuMTQtMy40MTEtMy40MTJ2LTc0LjU2N2MwLTIuMjczLDEuMTM1LTMuNDExLDMuNDExLTMuNDExDQoJCQkJYzIuMjczLDAsMy40MTIsMS4xMzgsMy40MTIsMy40MTF2MTIuNDI4YzIuOTI0LTUuMTk3LDYuODYxLTkuMzgyLDExLjgxOS0xMi41NWM0Ljk1NC0zLjE2NywxMC41MTctNC43NTIsMTYuNjkyLTQuNzUyDQoJCQkJYzYuOTgzLDAsMTIuOTk1LDEuOTkxLDE4LjAzMiw1Ljk3YzUuMDMzLDMuOTgzLDguNjg4LDkuMjIzLDEwLjk2NiwxNS43MTljMi43Ni02LjMzNiw2LjczOS0xMS41MzMsMTEuOTQtMTUuNTk2DQoJCQkJQzI5MS4xMjUsNDI5LjQ3NSwyOTcuMzgsNDI3LjQ0MSwzMDQuNjksNDI3LjQ0MXoiLz4NCgkJCTxwYXRoIGZpbGw9IiM0MTQwNDIiIGQ9Ik0zNzguNzUzLDQyOS4zOTJjMC44MTEsMCwxLjU4NCwwLjM2NSwyLjMxNCwxLjA5N2MwLjczMSwwLjczLDEuMDk3LDEuNTA0LDEuMDk3LDIuMzE0djc0LjA4DQoJCQkJYzAsMC44MTQtMC4zNjUsMS41ODQtMS4wOTcsMi4zMTVjLTAuNzMsMC43My0xLjUwNCwxLjA5Ny0yLjMxNCwxLjA5N2MtMC45NzUsMC0xLjc5LTAuMzY2LTIuNDM4LTEuMDk3DQoJCQkJYy0wLjY1LTAuNzMxLTAuOTc1LTEuNTAxLTAuOTc1LTIuMzE1di03NC4wOGMwLTAuODExLDAuMzI0LTEuNTg0LDAuOTc1LTIuMzE0QzM3Ni45NjMsNDI5Ljc1NywzNzcuNzc4LDQyOS4zOTIsMzc4Ljc1Myw0MjkuMzkyeiINCgkJCQkvPg0KCQkJPHBhdGggZmlsbD0iIzQxNDA0MiIgZD0iTTQ3My4zNCw0MjguNjZjMi4yNzMsMCwzLjQxMiwxLjEzOSwzLjQxMiwzLjQxMWwtMC40ODcsMS45NWwtMjQuMzY4LDM1LjMzNGwyNC4zNjgsMzUuNTc3DQoJCQkJYzAuMzIzLDAuOTc2LDAuNDg3LDEuNjI2LDAuNDg3LDEuOTVjMCwyLjI3Mi0xLjEzOSwzLjQxMi0zLjQxMiwzLjQxMmMtMS4zMDIsMC0yLjE5My0wLjQ4OC0yLjY4LTEuNDYzbC0yMi45MDYtMzMuMzg0DQoJCQkJbC0yMi42NjMsMzMuMzg0Yy0wLjgxNCwwLjk3NS0xLjc5LDEuNDYzLTIuOTI0LDEuNDYzYy0yLjI3NywwLTMuNDExLTEuMTQtMy40MTEtMy40MTJjMC0wLjMyNCwwLjE1OS0wLjk3NSwwLjQ4Ni0xLjk1DQoJCQkJbDI0LjM2OS0zNS41NzdsLTI0LjM2OS0zNS4zMzRsLTAuNDg2LTEuOTVjMC0yLjI3MiwxLjEzNC0zLjQxMSwzLjQxMS0zLjQxMWMxLjEzNCwwLDIuMTA5LDAuNDg3LDIuOTI0LDEuNDYybDIyLjY2MywzMy4xNDENCgkJCQlsMjIuOTA2LTMzLjE0MUM0NzEuMTQ2LDQyOS4xNDcsNDcyLjAzOCw0MjguNjYsNDczLjM0LDQyOC42NnoiLz4NCgkJPC9nPg0KCQk8Zz4NCgkJCTxnPg0KCQkJCTxnIG9wYWNpdHk9IjAuNDUiPg0KCQkJCQk8Zz4NCgkJCQkJCTxwb2x5Z29uIGZpbGw9IiMwMTAxMDEiIHBvaW50cz0iMTUwLjczNCwxOTYuMjEyIDI1NS45NjksMzQ0LjUwOCAyNTUuOTY5LDI1OC4zODciLz4NCgkJCQkJPC9nPg0KCQkJCTwvZz4NCgkJCQk8ZyBvcGFjaXR5PSIwLjgiPg0KCQkJCQk8Zz4NCgkJCQkJCTxwb2x5Z29uIGZpbGw9IiMwMTAxMDEiIHBvaW50cz0iMjU1Ljk2OSwyNTguMzg3IDI1NS45NjksMzQ0LjUwOCAzNjEuMjY3LDE5Ni4yMTIiLz4NCgkJCQkJPC9nPg0KCQkJCTwvZz4NCgkJCQk8ZyBvcGFjaXR5PSIwLjYiPg0KCQkJCQk8Zz4NCgkJCQkJCTxwb2x5Z29uIGZpbGw9IiMwMTAxMDEiIHBvaW50cz0iMjU1Ljk2OSwxMjYuNzgxIDE1MC43MzMsMTc0LjYxMSAyNTUuOTY5LDIzNi44MTggMzYxLjIwNCwxNzQuNjExIi8+DQoJCQkJCTwvZz4NCgkJCQk8L2c+DQoJCQkJPGcgb3BhY2l0eT0iMC40NSI+DQoJCQkJCTxnPg0KCQkJCQkJPHBvbHlnb24gZmlsbD0iIzAxMDEwMSIgcG9pbnRzPSIxNTAuNzM0LDE3NC42MTIgMjU1Ljk2OSwyMzYuODE4IDI1NS45NjksMTI2Ljc4MiAyNTUuOTY5LDAuMDAxIi8+DQoJCQkJCTwvZz4NCgkJCQk8L2c+DQoJCQkJPGcgb3BhY2l0eT0iMC44Ij4NCgkJCQkJPGc+DQoJCQkJCQk8cG9seWdvbiBmaWxsPSIjMDEwMTAxIiBwb2ludHM9IjI1NS45NjksMCAyNTUuOTY5LDEyNi43ODEgMjU1Ljk2OSwyMzYuODE4IDM2MS4yMDQsMTc0LjYxMSIvPg0KCQkJCQk8L2c+DQoJCQkJPC9nPg0KCQkJPC9nPg0KCQk8L2c+DQoJPC9nPg0KPC9zdmc+DQo=')",

      text_Primary: appProperties.mainText_Color,
      text_Secondary: appProperties.supportText_Color,
      text_RegularLog: appProperties.mainText_Color,
      text_InfoLog: appProperties.supportText_Color,
      text_ErrorLog: appProperties.errorText_Color,
      text_WarnLog: appProperties.warningText_Color,
      text_Title_TransactionLog: appProperties.infoText_Color,
      text_Regular_TransactionLog: appProperties.supportText_Color,
      text_Button: appProperties.oppositeText_Color,

      blockBorderTop: '2px solid ' + cssProperties.colors.veryLightGrey,

      icon_Color_Log_Succeed: appProperties.success_BorderColor,
      icon_Color_Log_Failed: appProperties.errorText_Color,
      icon_BackgroundColor_Log_Call: appProperties.infoText_Color,
      icon_Color_Log_Call: appProperties.icon_AltColor,

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
      backgroundColor_Panel: appProperties.fifth_BackgroundColor,
      backgroundColor_Tab: appProperties.fifth_BackgroundColor,
      BackgroundColor_Pre: appProperties.primary_BackgroundColor,

      text_Primary: appProperties.mainText_Color,
      text_Secondary: appProperties.supportText_Color,
      text_Teriary: appProperties.sub_supportText_Color,
      text_link: appProperties.brightText_Color,

      bar_Ghost: appProperties.ghostBar,
      bar_Dragging: appProperties.draggingBar,
      dragbarWidth: '2px',
      dragbarBackgroundColor: cssProperties.colors.veryLightGrey,

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
          Color: appProperties.primaryButton_TextColor,
          BorderWidth: appProperties.primaryButton_BorderWidth,
          BorderRadius: cssProperties.borders.primary_borderRadius,
          BorderStyle: 'solid'
        }),

        button_Details: appProperties.uiElements.button({
          BackgroundColor: appProperties.secondaryButton_BackgroundColor,
          BorderColor: appProperties.secondaryButton_BorderColor,
          Color: appProperties.secondaryButton_TextColor,
          BorderWidth: appProperties.primaryButton_BorderWidth,
          BorderRadius: cssProperties.borders.primary_borderRadius,
          BorderStyle: 'solid'
        }),

        button_Publish: appProperties.uiElements.button({
          BackgroundColor: appProperties.secondaryButton_BackgroundColor,
          BorderColor: appProperties.secondaryButton_BorderColor,
          Color: appProperties.secondaryButton_TextColor,
          BorderWidth: appProperties.primaryButton_BorderWidth,
          BorderRadius: cssProperties.borders.primary_borderRadius,
          BorderStyle: 'solid'
        }),

        dropdown_CompileContract: appProperties.uiElements.dropdown({
          BackgroundColor: appProperties.dropdown_BackgroundColor,
          BorderColor: appProperties.dropdown_BorderColor,
          Color: appProperties.dropdown_TextColor,
          BorderWidth: appProperties.primaryButton_BorderWidth,
          BorderRadius: cssProperties.borders.primary_borderRadius,
          BorderStyle: 'solid'
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

        additionalText_Color: appProperties.additionalText_Color,

        box_RunTab: appProperties.uiElements.solidBorderBox({
          BackgroundColor: appProperties.solidBox_BackgroundColor,
          Color: appProperties.solidBox_TextColor
        }),

        box_Info_RunTab: appProperties.uiElements.dottedBorderBox({
          BackgroundColor: appProperties.solidBorderBox_BackgroundColor,
          BorderColor: appProperties.solidBorderBox_BorderColor,
          Color: appProperties.solidBorderBox_TextColor
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
          Color: appProperties.primaryButton_TextColor,
          BorderWidth: appProperties.primaryButton_BorderWidth,
          BorderRadius: cssProperties.borders.primary_borderRadius,
          BorderStyle: 'solid'
        }),
        button_Create: appProperties.uiElements.button({
          BackgroundColor: appProperties.transactButton_BackgroundColor,
          BorderColor: appProperties.transactButton_BorderColor,
          Color: appProperties.transactButton_TextColor,
          BorderWidth: appProperties.primaryButton_BorderWidth,
          BorderRadius: cssProperties.borders.primary_borderRadius,
          BorderStyle: 'solid'
        }),
        button_Constant: appProperties.uiElements.button({
          BackgroundColor: appProperties.constantButton_BackgroundColor,
          BorderColor: appProperties.constantButton_BorderColor,
          Color: appProperties.constantButton_TextColor,
          BorderWidth: appProperties.primaryButton_BorderWidth,
          BorderRadius: cssProperties.borders.primary_borderRadius,
          BorderStyle: 'solid'
        }),
        button_Instance_Call: appProperties.uiElements.button({
          BackgroundColor: appProperties.callButton_BackgroundColor,
          BorderColor: appProperties.callButton_BorderColor,
          Color: appProperties.callButton_TextColor,
          BorderWidth: appProperties.primaryButton_BorderWidth,
          BorderRadius: cssProperties.borders.primary_borderRadius,
          BorderStyle: 'solid'
        }),
        button_Instance_Transact: appProperties.uiElements.button({
          BackgroundColor: appProperties.transactButton_BackgroundColor,
          BorderColor: appProperties.transactButton_BorderColor,
          Color: appProperties.transactButton_TextColor,
          BorderWidth: appProperties.primaryButton_BorderWidth,
          BorderRadius: cssProperties.borders.primary_borderRadius,
          BorderStyle: 'solid'
        }),

        button_Instance_TransactPayable: appProperties.uiElements.button({
          BackgroundColor: appProperties.transactPayableButton_BackgroundColor,
          BorderColor: appProperties.transactPayableButton_BorderColor,
          Color: appProperties.transactPayableButton_TextColor,
          BorderWidth: appProperties.primaryButton_BorderWidth,
          BorderRadius: cssProperties.borders.primary_borderRadius,
          BorderStyle: 'solid'
        }),

        icon_Color_Instance_CopyToClipboard: appProperties.icon_Color,
        icon_AltColor_Instance_CopyToClipboard: appProperties.icon_AltColor,
        icon_HoverColor_Instance_CopyToClipboard: appProperties.icon_HoverColor,

        icon_Color: appProperties.icon_Color,
        icon_HoverColor: appProperties.icon_HoverColor

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
          Color: appProperties.primaryButton_TextColor,
          BorderWidth: appProperties.primaryButton_BorderWidth,
          BorderRadius: cssProperties.borders.primary_borderRadius,
          BorderStyle: 'solid'
        }),

        button_generateTestFile: appProperties.uiElements.button({
          BackgroundColor: appProperties.primaryButton_BackgroundColor,
          BorderColor: appProperties.primaryButton_BorderColor,
          Color: appProperties.primaryButton_TextColor,
          BorderWidth: appProperties.primaryButton_BorderWidth,
          BorderRadius: cssProperties.borders.primary_borderRadius,
          BorderStyle: 'solid'
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
          Color: appProperties.secondaryButton_TextColor,
          BorderWidth: appProperties.primaryButton_BorderWidth,
          BorderRadius: cssProperties.borders.primary_borderRadius,
          BorderStyle: 'solid'
        }),
        button_initPlugin: appProperties.uiElements.button({
          BackgroundColor: appProperties.transactButton_BackgroundColor,
          BorderColor: appProperties.transactButton_BorderColor,
          Color: appProperties.secondaryButton_TextColor,
          BorderWidth: appProperties.primaryButton_BorderWidth,
          BorderRadius: cssProperties.borders.primary_borderRadius,
          BorderStyle: 'solid'
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
          BackgroundColor: appProperties.secondaryButton_BackgroundColor,
          BorderColor: appProperties.secondaryButton_BorderColor,
          Color: appProperties.secondaryButton_TextColor,
          BorderWidth: appProperties.primaryButton_BorderWidth,
          BorderRadius: cssProperties.borders.primary_borderRadius,
          BorderStyle: 'solid'
        }),

        button_Debugger_icon_Color: appProperties.icon_ConstantColor,
        button_Debugger_icon_HoverColor: appProperties.icon_HoverColor,

        dropdown_Debugger: appProperties.uiElements.dropdown({
          BackgroundColor: cssProperties.colors.veryLightGrey,
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
          Color: appProperties.primaryButton_TextColor,
          BorderWidth: appProperties.primaryButton_BorderWidth,
          BorderRadius: cssProperties.borders.primary_borderRadius,
          BorderStyle: 'solid'
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
