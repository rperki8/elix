import * as internal from "../../src/internal.js";
import * as template from "../../src/template.js";
import SeamlessButton from "../../src/SeamlessButton.js";

class CustomArrowButton extends SeamlessButton {
  get [internal.template]() {
    return template.concat(
      super[internal.template],
      template.html`
        <style>
          :host {
            align-items: center;
            display: flex;
            font-size: 28px;
            font-weight: bold;
            margin: 0.5em;
            -webkit-tap-highlight-color: transparent;
          }
          
          #inner {
            background: rgba(255, 255, 255, 0.2);
            border-color: rgba(255, 255, 255, 0.7);
            border: 2px solid transparent;
            box-sizing: border-box;
            color: inherit;
            color: rgba(255, 255, 255, 0.7);
            fill: currentColor;
            flex: 1;
            font: inherit;
            height: 48px;
            margin: 0;
            outline: none;
            padding: 0;
            position: relative;
            transform: scale(1.0);
            transition: background 0.3s, border-color 0.3s, color 0.3s, transform 0.3s;
            width: 48px;
          }

          :host(:hover) #inner:not(:disabled) {
            border-color: rgba(255, 255, 255, 0.8);
            color: rgba(255, 255, 255, 0.8);
            cursor: pointer;
            transform: scale(1.1);
          }

          #inner:disabled {
            color: rgba(255, 255, 255, 0.2);
            transform: scale(1.0);
          }
        </style>
      `
    );
  }
}

customElements.define("custom-arrow-button", CustomArrowButton);
export default CustomArrowButton;
