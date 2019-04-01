var yo = require('yo-yo')
var css = require('./styles/tooltip-styles')

/**
 * Open a tooltip
 * @param {string} tooltipText The text shown by the tooltip
 * @param {HTMLElement} [action] An HTMLElement to display for action
 */
module.exports = function addTooltip (tooltipText, action, opts) {
  let t = new Toaster()
  t.render(tooltipText, action, opts)
  return t
}

class Toaster {
  hide () {
    if (this.id) clearTimeout(this.id)
    setTimeout(() => {
      // remove from body after the animation is finished
      if (this.tooltip.parentElement) this.tooltip.parentElement.removeChild(this.tooltip)
    }, 2000)
    animation(this.tooltip, css.animateTop.className)
  }
  render (tooltipText, action, opts) {
    opts = defaultOptions(opts)

    return new Promise((resolve, reject) => {
      this.tooltip = yo`
    <div class="${css.tooltip} bg-secondary" onmouseenter=${() => { over() }} onmouseleave=${() => { out() }}>
      <span>${tooltipText}</span>
      ${action}
    </div>`
      let timeOut = () => {
        return setTimeout(() => {
          if (this.id) {
            this.hide()
            resolve()
          }
        }, opts.time)
      }
      let over = () => {
        if (this.id) {
          clearTimeout(this.id)
          this.id = null
        }
      }
      let out = () => {
        if (!this.id) this.id = timeOut()
      }
      this.id = timeOut()
      document.body.appendChild(this.tooltip)
      animation(this.tooltip, css.animateBottom.className)
    })
  }
}

let defaultOptions = (opts) => {
  opts = opts || {}
  return {
    time: opts.time || 7000
  }
}

let animation = (tooltip, anim) => {
  tooltip.classList.remove(css.animateTop.className)
  tooltip.classList.remove(css.animateBottom.className)
  void tooltip.offsetWidth // trick for restarting the animation
  tooltip.classList.add(anim)
}
