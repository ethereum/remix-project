var yo = require('yo-yo')
var remixLib = require('remix-lib')
var EventManager = remixLib.EventManager

// -------------- styling ----------------------
var css = require('./styles/auto-complete-popup-styles')

/* USAGE:

  var autoCompletePopup = new AutoCompletePopup({
    options: []
  })
  autoCompletePopup.event.register('handleSelect', function (input) { })
  autoCompletePopup.event.register('updateList', function () { })

*/

class AutoCompletePopup {
  constructor (opts = {}) {
    var self = this
    self.event = new EventManager()
    self.data = {
      _options: opts.options || []
    }
    self._view = {}
    self._startingElement = 0
    self._elementsToShow = 3
  }

  render () {
    var self = this
    self._view.autoComplete = yo`
        <div class="${css.popup}">
          <div class="${css.popupcontent}">
            ${self.data._options.map((item, index) => {
              return yo`
                <div class="${css.listHandlerHide}">
                  <hr/>
                    <a value=${index}>
                      <div onclick=${handleSelect}>
                        ${Object.keys(item)[0]} 
                      </div>
                    </a>
                    <div>
                      ${Object.values(item)[0]}
                    </div>
                  <hr/>
                </div>
              `
            })}
          </div>
          <button class="${css.listHandlerHide}" value=false onclick=${handleListIteration}>▲</button>
          <button class="${css.listHandlerHide}" value=true onclick=${handleListIteration}>▼</button>
          <div class="${css.listHandlerHide}">Page ${(self._startingElement / self._elementsToShow) + 1} of ${Math.ceil(self.data._options.length / self._elementsToShow)}</div>
        </div>
    `
    handleNagivationButtons()
    handleListSize()
    return self._view.autoComplete

    function handleSelect (event) {
      self.event.trigger('handleSelect', [event.srcElement.innerText])
    }
    function handleNagivationButtons () {
      if (self.data._options.length > self._elementsToShow) {
        self._view.autoComplete.children[1].className = css.listHandlerButtonShow
        self._view.autoComplete.children[2].className = css.listHandlerButtonShow
        self._view.autoComplete.children[3].className = css.pageNumberAlignment
      }
    }
    function handleListSize () {
      if (self.data._options.length >= self._startingElement) {
        for (let i = self._startingElement; i < (self._elementsToShow + self._startingElement); i++) {
          if (self._view.autoComplete.children[0].children[i]) {
            self._view.autoComplete.children[0].children[i].className = css.listHandlerShow
          }
        }
      }
    }
    function handleListIteration (event) {
      if (event.srcElement.value === 'true' || event.which === 40) {
        if ((self._startingElement + self._elementsToShow) < self.data._options.length) {
          self._startingElement += self._elementsToShow
        }
      } else {
        if (self._startingElement > 0) {
          self._startingElement -= self._elementsToShow
        }
      }
      self.event.trigger('updateList')
    }
  }
}

module.exports = AutoCompletePopup
