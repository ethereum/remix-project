// var csjs = require('csjs-inject')

module.exports = styleGuide

function styleGuide () {
  /* --------------------------------------------------------------------------
  COLORS
  -------------------------------------------------------------------------- */
  var colors = {
    // BACKGROUND COLORS
    general_BackgroundColor: 'hsl(0, 0%, 100%)',  // white
    highlight_BackgroundColor: 'hsla(229, 100%, 97%, 1)', // backgroundBlue

    // TEXT COLORS
    mainText_Color: 'hsl(0, 0%, 0%)', // black
    normalText_Color: 'hsla(0, 0%, 40%, 1)', // grey

    // ICONS
    icon_Color: 'hsl(0, 0%, 0%)', // black
    icon_HoverColor: 'hsla(44, 100%, 50%, 1)', // orange

    // DROPDOWN
    dropdown_TextColor: 'hsl(0, 0%, 0%)', // black ,
    dropdown_BackgroundColor: 'hsl(0, 0%, 100%)', // white
    dropdown_BorderColor: 'hsla(0, 0%, 40%, .2)', // very light grey


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
  }

  /* --------------------------------------------------------------------------
                                TEXT-BOXES
  -------------------------------------------------------------------------- */
  var textBoxes = {

    'display-box': `
      font-size             : 12px;
      padding               : 10px 15px;
      line-height           : 20px;
      background            : ${colors.white};
      border-radius         : 3px;
      border                : 1px solid ${colors.veryLightGrey};
      overflow              : hidden;
      word-break            : break-word;
      width                 : 100%;
    `,

    'info-text-box': `
      background-color      : ${colors.white};
      line-height           : 20px;
      border                : .2em dotted ${colors.lightGrey};
      padding               : 8px 15px;
      border-radius         : 5px;
      margin-bottom         : 1em;
      overflow              : hidden;
      word-break            : break-word;
    `,

    'input': `
      border                : 1px solid ${colors.veryLightGrey};
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
      display                 : flex;
      align-items             : center;
      justify-content         : center;
      border-color            : transparent;
      border-radius           : 3px;
      border                  : .3px solid ${colors.veryLightGrey};
      cursor                  : pointer;
      min-height              : 25px;
      max-height              : 25px;
      width                   : 70px;
      min-width               : 70px;
      font-size               : 12px;
      overflow                : hidden;
      word-break              : normal;
      background-color        : #E8E8E8;
    `,

    'button:hover': `
      opacity                 : 0.8;
    `,

    'dropdown': `
      color                   : ${colors.dropdown_TextColor};
      background-color        : ${colors.dropdown_BackgroundColor};
      border                  : 1px solid ${colors.dropdown_BorderColor};
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
    colors: colors,
    dropdown: buttons['dropdown'],
    button: buttons['button'],
    inputField: textBoxes['input'],
    infoTextBox: textBoxes['info-text-box'],
    displayBox: textBoxes['display-box']
  }
}
