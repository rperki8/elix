import { html } from '../node_modules/lit-html/lit-html.js';
import { formatStyleProps, mergeProps } from '../mixins/props.js';
import AttributeMarshallingMixin from '../mixins/AttributeMarshallingMixin.js';
import DefaultSlotContentMixin from '../mixins/DefaultSlotContentMixin.js';
import HostPropsMixin from '../mixins/HostPropsMixin.js';
// import LanguageDirectionMixin from '../mixins/LanguageDirectionMixin';
import LitHtmlShadowMixin from '../mixins/LitHtmlShadowMixin.js';
import ReactiveMixin from '../mixins/ReactiveMixin.js';
import symbols from '../mixins/symbols.js';


const Base =
  AttributeMarshallingMixin(
  DefaultSlotContentMixin(
  // FocusRingMixin(
  HostPropsMixin(
  LitHtmlShadowMixin(
  ReactiveMixin(
    HTMLElement
  )))));


/**
 * A classic rounded tab button.
 *
 * This component is used by [LabeledTabs](LabeledTabs), which will generate
 * an instance of `LabeledTabButton` for each panel in a set of tab panels.
 *
 * @extends HTMLElement
 */
class TabButton extends Base {

  get defaultState() {
    return Object.assign({}, super.defaultState, {
      index: 0,
      selected: false,
      tabAlign: 'start',
      tabindex: '0',
      tabPosition: 'top'
    });
  }

  get index() {
    return this.state.index;
  }
  set index(index) {
    const selectedIndex = typeof index === 'string' ?
      parseInt(index) :
      index;
    this.setState({
      index: selectedIndex
    });
  }

  hostProps(original) {
    const base = super.hostProps ? super.hostProps(original) : {};

    const stretch = this.state.tabAlign === 'stretch';

    const index = this.state.index;
    const needsSpacer = index > 0;
    const tabPosition = this.tabPosition;
    const needsLeftSpacer = needsSpacer &&
        (tabPosition === 'top' || tabPosition === 'bottom');
    const needsTopSpacer = needsSpacer &&
        (tabPosition === 'left' || tabPosition === 'right');

    const style = Object.assign(
      {},
      original.style,
      base.style,
      {
        'display': 'inline-flex',
        'flex': stretch ? 1 : null,
        'margin-left': needsLeftSpacer ? '0.2em' : null,
        'margin-top': needsTopSpacer ? '0.2em' : null,
      }
    );

    const tabindex = original.attributes.tabindex || this.state.tabindex;

    return mergeProps(base, {
      attributes: {
        tabindex
      },
      style
    });
  }

  get selected() {
    return this.state.selected;
  }
  set selected(selected) {
    this.setState({
      selected: String(selected) === 'true'
    });
  }

  get tabAlign() {
    return this.state.tabAlign;
  }
  set tabAlign(tabAlign) {
    this.setState({ tabAlign });
  }

  get tabPosition() {
    return this.state.tabPosition;
  }
  set tabPosition(tabPosition) {
    this.setState({ tabPosition });
  }

  get [symbols.template]() {
    const buttonStyle = this.buttonStyle();
    return html`
      <button style=${formatStyleProps(buttonStyle)} tabindex="-1">
        <slot></slot>
      </button>
    `;
  }

  buttonStyle() {

    const tabPosition = this.state.tabPosition;
    const positionStyles = {
      bottom: {
        'border-radius': '0 0 0.25em 0.25em',
        'margin-top': '-1px'
      },
      left: {
        'border-radius': '0.25em 0 0 0.25em',
        'margin-right': '-1px'
      },
      right: {
        'border-radius': '0 0.25em 0.25em 0',
        'margin-left': '-1px'
      },
      top: {
        'border-radius': '0.25em 0.25em 0 0',
        'margin-bottom': '-1px'
      }
    };
    const positionStyle = positionStyles[tabPosition];

    const selected = this.state.selected;
    const selectedStyle = {
      'opacity': 1,
      'z-index': 1
    };
    const borderSides = {
      'bottom': 'border-top-color',
      'left': 'border-right-color',
      'right': 'border-left-color',
      'top': 'border-bottom-color'
    };
    const borderSide = borderSides[tabPosition];
    selectedStyle[borderSide] = 'transparent';

    return Object.assign(
      {
        'background': 'inherit',
        'border-bottom-color': '#ccc',
        'border-left-color': '#ccc',
        'border-right-color': '#ccc',
        'border-style': 'solid',
        'border-top-color': '#ccc',
        'border-width': '1px',
        'color': 'inherit',
        'flex': 1,
        'font-family': 'inherit',
        'font-size': 'inherit',
        'margin': '0',
        'padding': '0.5em 0.75em',
        'transition': 'border-color 0.25s',
        'white-space': 'nowrap'
      },
      positionStyle,
      selected && selectedStyle
    );
  }

}


customElements.define('elix-tab-button', TabButton);
export default TabButton;