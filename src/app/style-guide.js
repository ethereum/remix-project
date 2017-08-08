var csjs = require('csjs-inject')

module.exports = styleGuide

function styleGuide () {
  /* --------------------------------------------------------------------------
  COLORS
  -------------------------------------------------------------------------- */
  var colors = {
    transparent: 'transparent',
    white: '#fff',
    black: '#000',
    blue: '#C6CFF7',
    lightBlue: '#F4F6FF',
    greyBlue: '#999999',
    grey: '#666',
    lightGrey: '#dddddd',
    red: '#FF8080',
    lightRed: '#FFB9B9',
    green: '#B1EAC5',
    violet: '#C6CFF7',
    pink: '#EC96EC',
    yellow: '#ffbd01',
    lightYellow: 'hsla(59, 56%, 78%, 0.5)'
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
      font-size             : 1em;
      padding               : 10px 15px;
      line-height           : 20px;
      background            : ${colors.white};
      border-radius         : 3px;
      border                : 1px solid ${colors.lightGrey};
      overflow              : hidden;
      word-break            : break-word;
      width                 : 100%;
    }

    .info-text-box {
      background-color      : white;
      line-height           : 20px;
      border                : .2em dotted ${colors.lightGrey};
      padding               : 8px 15px;
      border-radius         : 5px;
      margin-bottom         : 1em;
      overflow              : hidden;
      word-break            : break-word;
    }

    .warning-text-box {
      background-color      : hsla(59, 56%, 78%, 0.5);  // light yellow
      line-height           : 20px;
      padding               : 8px 15px;
      border-radius         : 5px;
      border                : .2em dotted ${colors.yellow}; // orange-yellow
      margin-bottom         : 1em;
      overflow              : hidden;
      word-break            : break-word;
    }

    .error-text-box {
      background-color      : ${colors.lightRed};  // light-red
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
      border                : 1px solid ${colors.lightGrey};  // light-grey
      margin                : .3em;
      height                : 25px;
      font-size             : 10px;
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
      border-color            : transparent;
      border-radius           : 3px;
      border                  : .3px solid ${colors.lightGrey};
      cursor                  : pointer;
      min-height              : 25px;
      max-height              : 25px;
      padding                 : 3px;
      min-width               : 100px;
      font-size               : 12px;
      overflow              : hidden;
      word-break            : normal;
      background-color      : #E8E8E8;
    }

    .button:hover {
      opacity                 : 0.8;
    }

    .dropdown {
      font-size               : 10px;
      padding                 : 0 8px;
      text-decoration         : none;
      background-color        : ${colors.white};
      cursor                  : pointer;
      border                  : 1px solid ${colors.lightGrey};
      border-radius           : 3px;
      height                  : 30px;
      text-align              : center;
      overflow              : hidden;
      word-break            : normal;
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
