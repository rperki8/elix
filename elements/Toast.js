//
// NOTE: This is a prototype, and not yet ready for real use.
//

import AsyncEffectMixin from '../mixins/AsyncEffectMixin.js';
import OpenCloseEffectMixin from '../mixins/OpenCloseEffectMixin.js';
import Popup from './Popup.js';
import symbols from '../mixins/symbols.js';


const durationKey = Symbol('duration');
const timeoutKey = Symbol('timeout');


const mixins = [
  AsyncEffectMixin,
  OpenCloseEffectMixin,
];

// Apply the above mixins to Popup.
const base = mixins.reduce((cls, mixin) => mixin(cls), Popup);


class Toast extends base {

  constructor() {
    super();

    // If the user moves the mouse over the element, stop the timer.
    this.addEventListener('mouseover', () => {
      clearTimer(this);
    });

    // If the user moves the mouse away, restart the timer.
    this.addEventListener('mouseout', () => {
      startTimer(this);
    });

    if (typeof this.duration === 'undefined') {
      this.duration = this[symbols.defaults].duration;
    }
  }

  [symbols.afterEffect](effect) {
    if (super[symbols.afterEffect]) { super[symbols.afterEffect](effect); }
    switch (effect) {
      case 'opening':
        startTimer(this);
        break;
    }
  }

  get [symbols.defaults]() {
    const defaults = super[symbols.defaults] || {};
    defaults.duration = 1000; /* milliseconds */
    return defaults;
  }

  get duration() {
    return this[durationKey];
  }
  set duration(duration) {
    this[durationKey] = parseInt(duration);
    if ('duration' in base.prototype) { super.duration = duration; }
  }

  get opened() {
    return super.opened;
  }
  set opened(opened) {
    const changed = opened !== this.opened;
    super.opened = opened;
    if (changed && !opened) {
      clearTimer(this);
    }
  }

  get [symbols.template]() {
    // Inject our template into the base template.
    let baseTemplate = super[symbols.template];
    if (baseTemplate instanceof HTMLTemplateElement) {
      baseTemplate = baseTemplate.innerHTML; // Downgrade to string.
    }
    const contentTemplate = `
      <style>
        :host {
          align-items: center;
          flex-direction: column;
          justify-content: flex-end;
        }

        #backdrop {
          background: none;
        }

        #overlayContent {
          margin-bottom: 1em;
          transform: translateY(100%);
          transition: transform 0.25s ease-in;
          will-change: transform;
        }

        :host(.opened) #overlayContent {
          transform: translateY(0);
          transition-timing-function: ease-out;
        }

        @media (prefers-reduced-motion) {
          #overlayContent {
            transition-duration: 0.001s;
          }
        }
      </style>
      <slot></slot>
    `;
    return baseTemplate.replace(`<slot></slot>`, contentTemplate);
  }

}


customElements.define('elix-toast', Toast);
export default Toast;


function clearTimer(element) {
  if (element[timeoutKey]) {
    clearTimeout(element[timeoutKey]);
    element[timeoutKey] = null;
  }
}

function startTimer(element) {
  clearTimer(element);
  element[timeoutKey] = setTimeout(() => {
    element.close();
  }, element.duration);
}