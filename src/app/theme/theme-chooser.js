var remixLib = require('remix-lib')
var styleGuide = remixLib.ui.styleGuide
var styleGuideDark = remixLib.ui.styleGuideDark
module.exports = function () {
   // if (storage.get('theme') === 'light' ) {
   //    return styleGuide
   // } else {
   //    return styleGuideDark
   // }
  return styleGuideDark()
  //errors cannot find styleGuideDark

  //return styleGuide()
  //works

  //return styleGuide
  // does not work - it needs the prenthesies - to make it return the function
}
