var yo = require('yo-yo')
var remixLib = require('remix-lib')
var EventManager = remixLib.EventManager

var modal = require('./modaldialog.js')

// -------------- styling ----------------------
var css = require('./styles/auto-complete-popup-styles')
var cssModal = require('./styles/modaldialog-styles')

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
    self._removePopUp = this.resetCSSValuesModalContainer
  }

  resetCSSValuesModalContainer () {
    var modalContainer = document.querySelector(`.${cssModal.modal}`)
    modalContainer.style.display = 'none'
    var modalContent = document.querySelector(`.${css.modalContent}`)
    let newModalContent = modalContent ? document.querySelector(`.${css.modalContent}`) : document.querySelector(`.${cssModal.modalContent}`)
    newModalContent.className = cssModal.modalContent
  }

  render () {
    var self = this
    var header = yo`<div class="${css.text}">Remix Commands</div>`
    self._view.autoComplete = yo`
      <div class="${css.popup}">
        <div>
          ${self.data._options.map((item, index) => {
            return yo`
              <div class="${css.listHandlerHide}">
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
        <div class="${css.listHandlerHide}">
          <button value=false onclick=${handleListIteration}>▲</button>
          <button value=true onclick=${handleListIteration}>▼</button>
          <div class="${css.pageNumberAlignment}">Page ${(self._startingElement / self._elementsToShow) + 1} of ${Math.ceil(self.data._options.length / self._elementsToShow)}</div>
        </div>
      </div>
    `
    function setUpPopUp () {
      handleOpenPopup()
      handleNagivationButtons()
      handleListSize()
    }

    function handleOpenPopup () {
      if (self.data._options.length > 1) {
        self._view.autoComplete.style.display = 'block'
        modal(header.innerText, self._view.autoComplete, {label: null},
          {
            fn: () => { self._removePopUp() }
          })
        editCSSValuesModalContainer()
      }
    }

    function handleSelect (event) {
      self._removePopUp()
      self._view.autoComplete.style.display = 'none'
      self.event.trigger('handleSelect', [event.srcElement.innerText])
    }

    function handleNagivationButtons () {
      if (self.data._options.length > self._elementsToShow) {
        self._view.autoComplete.children[1].className = css.listHandlerButtonShow
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

    function editCSSValuesModalContainer () {
      var modalContent = document.querySelector(`.${cssModal.modalContent}`)
      let newModalContent = modalContent ? document.querySelector(`.${cssModal.modalContent}`) : document.querySelector(`.${css.modalContent}`)
      newModalContent.className = css.modalContent
    }

    setUpPopUp()
    return self._view
  }

}

module.exports = AutoCompletePopup
