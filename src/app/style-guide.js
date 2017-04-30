var csjs = require('csjs-inject')

module.exports = styleGuide

function styleGuide () {
  /* --------------------------------------------------------------------------
  COLORS
  -------------------------------------------------------------------------- */
  var colors = {
    blue: '#9393bf',
    lightBlue: '#F4F6FF',
    greyBlue: '#102026',
    grey: '#666',
    lightGrey: '#dddddd',
    red: '#FF8080',
    lightRed: '#FFB9B9',
    green: '#B1EAC5',
    violet: '#C6CFF7',
    pink: '#EC96EC',
    yellow: '#ffbd01'
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
    .display-box-L {
      font-size             : 1em;
      padding               : 8px 15px;
      line-height           : 20px;
      background            : #f8f8f8;
      border-radius         : 3px;
      border                : 1px solid #e5e5e5;
      overflow-x            : auto;
      width                 : 100%;
    }

    .info-text-box {
      background-color      : white;
      line-height           : 20px;
      border                : .2em dotted lightGrey;
      padding               : 8px 15px;
      border-radius         : 5px;
      margin-bottom         : 1em;
    }

    .warning-text-box {
      background-color      : #E6E5A7;  // yellow
      line-height           : 20px;
      padding               : 1em 1em .5em 1em;
      border-radius         : 3px;
      box-shadow            : rgba(0,0,0,.2) 0 1px 4px;
      margin-bottom         : 1em;
    }

    .error-text-box {
      background-color      : #FFB9B9;  // light-red
      line-height           : 20px;
      padding               : 1em 1em .5em 1em;
      border-radius         : 3px;
      box-shadow            : rgba(0,0,0,.2) 0 1px 4px;
      margin-bottom         : 1em;
    }

    .title-box {
      margin-bottom         : 0.4em;
      padding               : 1em;
      background-color      : transparent;
      font-weight           : bold;
      display               : flex;
      justify-content       : space-between;
      word-wrap             : break-word;
      position              : relative;
      border-radius         : 3px;
    }
  `
  /* --------------------------------------------------------------------------
                                    BUTTONS
  -------------------------------------------------------------------------- */
  var buttons = csjs`
    .button {
      border-color            : transparent;
      border-radius           : 3px;
      cursor                  : pointer;
      padding                 : .3em;
    }

    .button:hover {
      opacity                 : 0.8;
    }

    .dropdown-menu {
      font-size               : 1em;
      text-decoration         : none;
      background-color        : #C6CFF7;
      cursor                  : pointer;
      font-size               : 12px;
      border                  : none;
      height                  : 20px;
    }

  `

  /* --------------------------------------------------------------------------
                                INPUT FIELDS
  -------------------------------------------------------------------------- */
  /*
  .input-field {
    border                : 1px solid #f0f0f0;  // light-grey
    padding               : .3em;
    margin                : .3em;
  }
  */
  return {
    textBoxL: textBoxes['display-box-L'],
    infoTextBox: textBoxes['info-text-box'],
    titleL: texts['title-L'],
    titleM: texts['title-M'],
    dropdown: buttons['dropdown-menu'],
    button: buttons['button'],
    colors: colors,
    titleBox: textBoxes['title-box']
  }
}
