var csjs = require('csjs-inject')

module.exports = styleGuide

function styleGuide () {
  /* --------------------------------------------------------------------------
  COLORS
  -------------------------------------------------------------------------- */
  var colors = {
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
                              FONTS
  -------------------------------------------------------------------------- */
  var texts = csjs `
    .title-XL {
      font-size             : 2em;
      font-weight           : 700;
      letter-spacing        : .05em;
    }

    .title-L {
      font-size             : 1em;
      font-weight           : 600;
    }

    .title-M {
      font-size             : 1em;
      font-weight           : 400;
    }

    .title-S {
      font-size             : .8em;
      font-weight           : 300;
    }

    .text {
      font-size             : .8em;
    }
  `
  /* --------------------------------------------------------------------------
                                TEXT-BOXES
  -------------------------------------------------------------------------- */
  var textBoxes = csjs`
    .display-box {
      font-size             : 12px;
      padding               : 10px 15px;
      line-height           : 20px;
      background            : ${colors.white};
      border-radius         : 3px;
      border                : 1px solid ${colors.veryLightGrey};
      overflow              : hidden;
      word-break            : break-word;
      width                 : 100%;
    }

    .info-text-box {
      background-color      : ${colors.white};
      line-height           : 20px;
      border                : .2em dotted ${colors.lightGrey};
      padding               : 8px 15px;
      border-radius         : 5px;
      margin-bottom         : 1em;
      overflow              : hidden;
      word-break            : break-word;
    }

    .warning-text-box {
      background-color      : ${colors.lightOrange};
      line-height           : 20px;
      padding               : 8px 15px;
      border-radius         : 5px;
      border                : .2em dotted ${colors.orange};
      margin-bottom         : 1em;
      overflow              : hidden;
      word-break            : break-word;
    }

    .error-text-box {
      background-color      : ${colors.lightRed};
      line-height           : 20px;
      padding               : 1em 1em .5em 1em;
      border-radius         : 3px;
      box-shadow            : rgba(0,0,0,.2) 0 1px 4px;
      margin-bottom         : 1em;
      overflow              : hidden;
      word-break            : break-word;
    }

    .title-box {
      margin-bottom         : 0.4em;
      padding               : .3em;
      background-color      : transparent;
      font-weight           : bold;
      display               : flex;
      justify-content       : space-between;
      word-wrap             : break-word;
      position              : relative;
      border-radius         : 3px;
      overflow              : hidden;
      word-break            : normal;
    }
    .input {
      border                : 1px solid ${colors.veryLightGrey};
      height                : 25px;
      width                 : 250px;
      font-size             : 12px;
      border-radius         : 3px;
      padding               : 0 8px;
      overflow              : hidden;
      word-break            : normal;
    }
  `
  /* --------------------------------------------------------------------------
                                    BUTTONS
  -------------------------------------------------------------------------- */
  var buttons = csjs`
    .button {
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
    }

    .button:hover {
      opacity                 : 0.8;
    }

    .dropdown {
      font-size               : 12px;
      font-weight             : bold;
      padding                 : 0 8px;
      text-decoration         : none;
      background-color        : ${colors.white};
      cursor                  : pointer;
      border                  : 1px solid ${colors.veryLightGrey};
      border-radius           : 3px;
      height                  : 25px;
      width                   : 250px;
      text-align              : center;
      overflow                : hidden;
      word-break              : normal;
    }

  `

  return {
    textBoxL: textBoxes['display-box-L'],
    infoTextBox: textBoxes['info-text-box'],
    inputField: textBoxes['input'],
    displayBox: textBoxes['display-box'],
    warningTextBox: textBoxes['warning-text-box'],
    titleL: texts['title-L'],
    titleM: texts['title-M'],
    dropdown: buttons['dropdown'],
    button: buttons['button'],
    colors: colors,
    titleBox: textBoxes['title-box']
  }
}
