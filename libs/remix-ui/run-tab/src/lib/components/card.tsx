// eslint-disable-next-line no-use-before-define
import React, { useRef, useState } from 'react'
import { CardProps } from '../types'
import '../css/card.css'

export function Card (props: CardProps) {

  return (
    self._view.statusBar = yo``

    function trigger (el) {
      var body = self._view.cardBody
      var status = self._view.statusBar
      if (el.classList) {
        el.classList.toggle('fa-angle-up')
        var arrow = el.classList.toggle('fa-angle-down') ? 'up' : 'down'
        self.event.trigger('expandCollapseCard', [arrow, body, status])
      }
    }

    <div class="${css.cardContainer} list-group-item border-0">
      <div class="d-flex justify-content-between align-items-center" onclick=${() => trigger(self._view.arrow)}>
        <div class="pr-1 d-flex flex-row">
          <div>${self._opts.title}</div>
          <div>${self._opts.collapsedView}</div>
        </div>
        <div>
          <div>
            <i class="${css.arrow} fas fa-angle-down" onclick="${() => trigger(this)}"></i>
          </div>
        </div>
    </div>
      <div></div>
    </div>
  )
}
