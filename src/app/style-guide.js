var csjs = require('csjs-inject')

module.exports = styleGuide

function styleGuide () {
  /* --------------------------------------------------------------------------
  COLORS
  -------------------------------------------------------------------------- */
  var blue                = '#9DC1F5'
  var lightBlue           = '#F4F6FF'
  var greyBlue            = '#102026'
  var grey                = '#666'
  var lightGrey           = '#f8f8f8'
  var red                 = '#FF8080'
  var lightRed            = '#FFB9B9'
  var green               = '#B1EAC5'
  var violet              = '#C6CFF7'
  var pink                = '#EC96EC'
  var yellow              = '#E6E5A7'
  /* --------------------------------------------------------------------------
                              FONTS
  -------------------------------------------------------------------------- */
  var texts = csjs `
    .title-XL {
      font-size             : 2em;
      font-weight           : 500;
      letter-spacing        : .05em;
    }

    .title-L {
      font-size             : .9em;
      font-weight           : 500;
    }

    .title-M {
      font-size             : .8em;
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
      border                : .3em dotted #B1EAC5;
      padding               : 8px 15px;
      border-radius         : 3px;
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
  `
  /* --------------------------------------------------------------------------
                                    BUTTONS
  -------------------------------------------------------------------------- */
  /*
  .button {
    border-color: transparent;
    margin-right: 1em;
    border-radius: 3px;
    cursor: pointer;
    padding: .3em;
  }

  .button:hover {
  	opacity: 0.8;
  }

  */

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
    titleL: texts['title-L']
  }
}

/*
HOW TO USE IT
var csjs = require('csjs-inject')
var styleGuide = require('./app/style-guide')
var styles = styleGuide()

var css = csjs`
  .foobar extends ${styles.fontXL} {
    color: red;
  }
`
var el = yo`
  <div class=${css.foobar}> alasdalsd </div>
`
*/

/*
var text = 'foobar'

var example1 = 'hello ' + text + ' "world"'
var example2 = "hello " + text + " \"world\""
var example3 = `hello ${text} "world"`

// hello foobar "world"

<div class='title foo'></div>
<div class="${css.title} ${css.foo}"></div>

`<div class="${css.col2} ${styles.textBoxL} ${5+5}">`
// <div class="col2_s3ad textBoxL_13 10">

'<div class="${css.col2} ${styles.textBoxL} ${5+5}">'
// <div class="${css.col2} ${styles.textBoxL} ${5+5}">

append($('<div class="col2_wefwq textBoxL_efwq">'))


*/
