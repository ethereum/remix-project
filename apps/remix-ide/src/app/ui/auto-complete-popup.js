var yo = require('yo-yo')
var remixLib = require('remix-lib')
var EventManager = remixLib.EventManager
var Commands = require('../../lib/commands')

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
    self.isOpen = false
    self.opts = opts
    self.data = {
      _options: []
    }
    self._components = {}
    self._view
    self._startingElement = 0
    self._elementsToShow = 4
    self._selectedElement = 0
    this.extraCommands = []
    this.extendAutocompletion()
  }

  render () {
    var self = this
    let autoComplete = yo`
      <div class="${css.popup} alert alert-secondary">
        <div>
          ${self.data._options.map((item, index) => {
            return yo`
              <div data-id="autoCompletePopUpAutoCompleteItem" class="${css.autoCompleteItem} ${css.listHandlerHide} item ${self._selectedElement === index ? 'border border-primary' : ''}">
                  <div value=${index} onclick=${(event) => { self.handleSelect(event.srcElement.innerText) }}>
                    ${getKeyOf(item)} 
                  </div>
                  <div>
                    ${getValueOf(item)}
                  </div>
              </div>
            `
          })}
        </div>
        <div class="${css.listHandlerHide}">
          <div class="${css.pageNumberAlignment}">Page ${(self._startingElement / self._elementsToShow) + 1} of ${Math.ceil(self.data._options.length / self._elementsToShow)}</div>
        </div>
      </div>
    `
    function setUpPopUp (autoComplete) {
      handleOpenPopup(autoComplete)
      handleListSize(autoComplete)
    }

    function handleOpenPopup (autoComplete) {
      autoComplete.style.display = self.data._options.length > 0 ? 'block' : 'none'
    }

    function handleListSize (autoComplete) {
      if (self.data._options.length >= self._startingElement) {
        for (let i = self._startingElement; i < (self._elementsToShow + self._startingElement); i++) {
          let el = autoComplete.querySelectorAll('.item')[i]
          if (el) {
            el.classList.remove(css.listHandlerHide)
            el.classList.add(css.listHandlerShow)
          }
        }
      }
    }
    setUpPopUp(autoComplete)
    if (!this._view) this._view = autoComplete
    return autoComplete
  }

  handleSelect (text) {
    this.removeAutoComplete()
    this.event.trigger('handleSelect', [text])
  }

  moveUp () {
    if (this._selectedElement === 0) return
    this._selectedElement--
    this._startingElement = this._selectedElement > 0 ? this._selectedElement - 1 : 0
    this.event.trigger('updateList')
    yo.update(this._view, this.render())
  }

  moveDown () {
    if (this.data._options.length <= this._selectedElement + 1) return
    this._selectedElement++
    this._startingElement = this._selectedElement - 1
    this.event.trigger('updateList')
    yo.update(this._view, this.render())
  }

  handleAutoComplete (event, inputString) {
    if (this.isOpen && (event.which === 27 || event.which === 8 || event.which === 46)) {
      // backspace or any key that should remove the autocompletion
      this.removeAutoComplete()
      return true
    }
    if (this.isOpen && (event.which === 13 || event.which === 9)) {
      // enter and tab (validate completion)
      event.preventDefault()
      if (this.data._options[this._selectedElement]) {
        this.handleSelect(getKeyOf(this.data._options[this._selectedElement]))
      }
      this.removeAutoComplete()
      return true
    }
    if (this.isOpen && event.which === 38) {
      // move up
      event.preventDefault()
      this.isOpen = true
      this.moveUp()
      return true
    }
    if (this.isOpen && event.which === 40) {
      // move down
      event.preventDefault()
      this.isOpen = true
      this.moveDown()
      return true
    }
    if (event.which === 13 || event.which === 9) {
      // enter || tab and autocompletion is off, just returning false
      return false
    }
    let textList = inputString.split(' ')
    let autoCompleteInput = textList.length > 1 ? textList[textList.length - 1] : textList[0]
    if (inputString.length >= 2) {
      // more than 2 letters, start completion
      this.data._options = []
      Commands.allPrograms.forEach(item => {
        const program = getKeyOf(item)
        if (program.substring(0, program.length - 1).includes(autoCompleteInput.trim())) {
          this.data._options.push(item)
        } else if (autoCompleteInput.trim().includes(program) || (program === autoCompleteInput.trim())) {
          Commands.allCommands.forEach(item => {
            const command = getKeyOf(item)
            if (command.includes(autoCompleteInput.trim())) {
              this.data._options.push(item)
            }
          })
        }
      })
      this.extraCommands.forEach(item => {
        const command = getKeyOf(item)
        if (command.includes(autoCompleteInput.trim())) {
          this.data._options.push(item)
        }
      })

      if (this.data._options.length === 1 && event.which === 9) {
        // if only one option and tab is pressed, we resolve it
        event.preventDefault()
        textList.pop()
        textList.push(getKeyOf(this.data._options[0]))
        this.handleSelect(`${textList}`.replace(/,/g, ' '))
        this.removeAutoComplete()
        return
      }
      if (this.data._options.length) this.isOpen = true
      yo.update(this._view, this.render())
      return true
    }
    return false
  }

  removeAutoComplete () {
    if (!this.isOpen) return
    this._view.style.display = 'none'
    this.isOpen = false
    this.data._options = []
    this._startingElement = 0
    this._selectedElement = 0
    yo.update(this._view, this.render())
  }

  extendAutocompletion () {
    // TODO: this is not using the appManager interface. Terminal should be put as module
    this.opts.appManager.event.on('activate', async (profile) => {
      if (!profile.methods) return
      profile.methods.forEach((method) => {
        const key = `remix.call({name: '${profile.name}', key:'${method}', payload: []}).then((result) => { console.log(result) }).catch((error) => { console.log(error) })`
        const keyValue = {}
        keyValue[key] = `call ${profile.name} - ${method}`
        if (this.extraCommands.includes(keyValue)) return
        this.extraCommands.push(keyValue)
      })
    })
  }
}

function getKeyOf (item) {
  return Object.keys(item)[0]
}

function getValueOf (item) {
  return Object.values(item)[0]
}

module.exports = AutoCompletePopup
