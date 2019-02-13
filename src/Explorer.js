import { apply, merge } from './updates.js';
import * as symbols from './symbols.js';
import * as template from './template.js';
import LanguageDirectionMixin from './LanguageDirectionMixin.js';
import ListBox from './ListBox.js';
import Modes from './Modes.js';
import ReactiveElement from './ReactiveElement.js';
import SingleSelectionMixin from './SingleSelectionMixin.js';
import SlotItemsMixin from './SlotItemsMixin.js';
// import ComposedFocusMixin from './ComposedFocusMixin.js';


const proxySlotchangeFiredKey = Symbol('proxySlotchangeFired');


// Does a list position imply a lateral arrangement of list and stage?
const lateralPositions = {
  end: true,
  left: true,
  right: true,
  start: true
};


const Base =
  // ComposedFocusMixin(
  LanguageDirectionMixin(
  SingleSelectionMixin(
  SlotItemsMixin(
    ReactiveElement
  )));


/**
 * Combines a list with an area focusing on a single selected item.
 *
 * @inherits ReactiveElement
 * @mixes ComposedFocusMixin
 * @mixes LanguageDirectionMixin
 * @mixes SingleSelectionMixin
 * @mixes SlotItemsMixin
 * @elementrole {'div'} proxy
 * @elementrole {ListBox} proxyList
 * @elementrole {Modes} stage
 */
class Explorer extends Base {

  constructor() {
    super();
    this[symbols.renderedRoles] = {};
  }

  [symbols.beforeUpdate]() {
    if (super[symbols.beforeUpdate]) { super[symbols.beforeUpdate](); }

    const handleSelectedIndexChanged = event => {
      this[symbols.raiseChangeEvents] = true;
      const selectedIndex = event.detail.selectedIndex;
      if (this.selectedIndex !== selectedIndex) {
        this.selectedIndex = selectedIndex;
      }
      this[symbols.raiseChangeEvents] = false;
    };

    if (this[symbols.renderedRoles].proxyListRole !== this.state.proxyListRole) {
      template.transmute(this.$.proxyList, this.state.proxyListRole);
      this[symbols.renderedRoles].proxyListRole = this.state.proxyListRole;
      this.$.proxyList.addEventListener('selected-index-changed', handleSelectedIndexChanged);
    }

    if (this[symbols.renderedRoles].stageRole !== this.state.stageRole) {
      template.transmute(this.$.stage, this.state.stageRole);
      this[symbols.renderedRoles].stageRole = this.state.stageRole;
      this.$.stage.addEventListener('selected-index-changed', handleSelectedIndexChanged);
    }
  }

  [symbols.checkSize]() {
    if (super[symbols.checkSize]) { super[symbols.checkSize](); }
    if (this.$.stage[symbols.checkSize]) {
      this.$.stage[symbols.checkSize]();
    }
    if (this.$.proxyList[symbols.checkSize]) {
      this.$.proxyList[symbols.checkSize]();
    }
  }

  componentDidMount() {
    if (super.componentDidMount) { super.componentDidMount(); }

    // Work around inconsistencies in slotchange timing; see SlotContentMixin.
    this.$.proxySlot.addEventListener('slotchange', () => {
      this[proxySlotchangeFiredKey] = true;
      updateAssignedProxies(this);
    });
    Promise.resolve().then(() => {
      if (!this[proxySlotchangeFiredKey]) {
        // The event didn't fire, so we're most likely in Safari.
        // Update our notion of the component content.
        this[proxySlotchangeFiredKey] = true;
        updateAssignedProxies(this);
      }
    });
  }

  get defaultState() {
    const state = Object.assign(super.defaultState, {
      assignedProxies: [],
      defaultProxies: [],
      proxyRole: 'div',
      proxyListOverlap: false,
      proxyListPosition: 'top',
      proxyListRole: ListBox,
      stageRole: Modes
    });

    // If items for default proxies have changed, recreate the proxies.
    state.onChange(['assignedProxies', 'proxyRole', 'items'], (state, changed) => {
      const {
        assignedProxies,
        items,
        proxyRole
      } = state;
      if (changed.assignedProxies && assignedProxies.length > 0) {
        // Assigned proxies take precedence, remove default proxies.
        return {
          defaultProxies: []
        };
      } else if ((changed.items || changed.proxyRole) &&
          assignedProxies.length === 0) {
        // Generate sufficient default proxies.
        return {
          defaultProxies: createDefaultProxies(items, proxyRole)
        };
      }
      return null;
    });

    return state;
  }

  /**
   * The current set of proxy elements that correspond to the component's
   * main `items`. If you have assigned elements to the `proxy` slot, this
   * returns the collection of those elements. Otherwise, this will return
   * a collection of default proxies generated by the component, one for
   * each item.
   * 
   * @type {Element[]}
   */
  get proxies() {
    return this.state.defaultProxies.length > 0 ?
      this.state.defaultProxies :
      this.state.assignedProxies;
  }

  /**
   * True if the list of proxies should overlap the stage, false if not.
   * 
   * @type {boolean}
   * @default false
   */
  get proxyListOverlap() {
    return this.state.proxyListOverlap;
  }
  set proxyListOverlap(proxyListOverlap) {
    const parsed = String(proxyListOverlap) === 'true';
    this.setState({
      proxyListOverlap: parsed
    });
  }

  /**
   * The position of the proxy list relative to the stage.
   * 
   * The `start` and `end` values refer to text direction: in left-to-right
   * languages such as English, these are equivalent to `left` and `right`,
   * respectively.
   * 
   * @type {('bottom'|'end'|'left'|'right'|'start'|'top')}
   * @default 'start'
   */
  get proxyListPosition() {
    return this.state.proxyListPosition;
  }
  set proxyListPosition(proxyListPosition) {
    this.setState({ proxyListPosition });
  }

  /**
   * The class, tag, or template used to create the Explorer's list of proxies.
   * 
   * @type {function|string|HTMLTemplateElement}
   * @default ListBox
   */
  get proxyListRole() {
    return this.state.proxyListRole;
  }
  set proxyListRole(proxyListRole) {
    this.setState({ proxyListRole });
  }

  /**
   * The class, tag, or template used to create default proxies for the list
   * items.
   * 
   * @type {function|string|HTMLTemplateElement}
   * @default 'div'
   */
  get proxyRole() {
    return this.state.proxyRole;
  }
  set proxyRole(proxyRole) {
    this.setState({ proxyRole });
  }

  /**
   * Determine what updates should be applied to a proxy to reflect the state of
   * the corresponding item, using the format defined by the [updates](updates)
   * helpers.
   * 
   * By default, this returns an empty object. You should override this method
   * (or use mixins that override this method) to indicate what updates should
   * be applied to the given proxy during rendering.
   * 
   * The `calcs` parameter is an object with the following members:
   * 
   * * `index`: the index of this proxy in the list.
   * * `isDefaultProxy`: true if this proxy was generated by the `Explorer`,
   *   false if the proxy was assigned to the Explorer's `proxy` slot.
   * * `item`: the list item corresponding to this proxy. E.g., for a tab
   *   button, the `item` is the corresponding tab panel.
   * 
   * @param {Element} proxy - the proxy to be updated
   * @param {object} calcs - per-proxy calculations derived from element state
   * @returns {object} the DOM updates that should be applied to the item
   */
  proxyUpdates(/* eslint-disable no-unused-vars */ proxy, calcs) {
    return {};
  }

  [symbols.render]() {
    if (super[symbols.render]) { super[symbols.render](); }

    setListAndStageOrder(this);

    const items = this.items;
    if (items) {
      // Render updates for proxies.
      const proxies = this.proxies;
      const isDefaultProxy = this.state.defaultProxies.length > 0;
      proxies.forEach((proxy, index) => {
        // Ask component for any updates to this proxy.
        const item = items[index];
        const calcs = {
          item,
          index,
          isDefaultProxy
        };
        const updates = this.proxyUpdates(proxy, calcs);
        // Apply updates to the proxy.
        /** @type {any} */
        const element = proxy;
        apply(element, updates);
      });
    }
  }

  /**
   * The class, tag, or template used for the main "stage" element that shows a
   * single item at a time.
   * 
   * @type {function|string|HTMLTemplateElement}
   * @default Modes
   */
  get stageRole() {
    return this.state.stageRole;
  }
  set stageRole(stageRole) {
    this.setState({ stageRole });
  }

  get [symbols.template]() {
    return template.html`
      <style>
        :host {
          display: inline-flex;
        }
        
        #explorerContainer {
          display: flex;
          flex: 1;
          max-width: 100%; /* For Firefox */
          position: relative;
        }

        #stage {
          flex: 1;
        }
      </style>
      <div id="explorerContainer" role="none">
        <div id="proxyList"><slot id="proxySlot" name="proxy"></slot></div>
        <div id="stage" role="none"><slot></slot></div>
      </div>
    `;
  }

  get updates() {
    // Map the relative position of the list vis-a-vis the stage to a position
    // from the perspective of the list.
    const proxyListHasPosition = 'position' in this.$.proxyList;
    const proxyListPosition = this.state.proxyListPosition;
    const lateralPosition = lateralPositions[proxyListPosition];
    const rightToLeft = this[symbols.rightToLeft];
    let position;
    switch (proxyListPosition) {
      case 'end':
        position = rightToLeft ? 'left' : 'right';
        break;
      case 'start':
        position = rightToLeft ? 'right' : 'left';
        break;
      default:
        position = proxyListPosition;
        break;
    }

    const selectedIndex = this.selectedIndex;
    const proxyListHasSwipeFraction = 'swipeFraction' in this.$.proxyList;
    const stageHasSwipeFraction = 'swipeFraction' in this.$.stage;
    const swipeFraction = this.state.swipeFraction;

    const proxyListHasSelectionRequired = 'selectionRequired' in this.$.proxyList;

    const listChildNodes = [this.$.proxySlot, ...this.state.defaultProxies];
    const listStyle = {
      bottom: '',
      height: '',
      left: '',
      position: '',
      right: '',
      top: '',
      width: '',
      'z-index': ''
    };
    if (this.state.proxyListOverlap) {
      listStyle.position = 'absolute';
      listStyle['z-index'] = '1';
      if (lateralPosition) {
        listStyle.height = '100%';
      } else {
        listStyle.width = '100%';
      }
      listStyle[proxyListPosition] = '0';
    }

    return merge(super.updates, {
      $: {
        explorerContainer: {
          style: {
            'flex-direction': lateralPosition ? 'row' : 'column'
          },
        },
        proxyList: Object.assign(
          {
            childNodes: listChildNodes,
            selectedIndex,
            style: listStyle
          },
          proxyListHasPosition && {
            position
          },
          proxyListHasSwipeFraction && {
            swipeFraction
          },
          proxyListHasSelectionRequired && {
            selectionRequired: true
          }
        ),
        stage: Object.assign(
          {
            selectedIndex
          },
          stageHasSwipeFraction && {
            swipeFraction
          }
        )
      }
    });
  }

}


// Return the default list generated for the given items.
function createDefaultProxies(items, proxyRole) {
  const proxies = items ?
    items.map(() => template.createElement(proxyRole)) :
    [];
  // Make the array immutable to help update performance.
  Object.freeze(proxies);
  return proxies;
}


// Find the child of root that is or contains the given node.
function findChildContainingNode(root, node) {
  const parentNode = node.parentNode;
  return parentNode === root ?
    node :
    findChildContainingNode(root, parentNode);
}


// Physically reorder the list and stage to reflect the desired arrangement. We
// could change the visual appearance by reversing the order of the flex box,
// but then the visual order wouldn't reflect the document order, which
// determines focus order. That would surprise a user trying to tab through the
// controls.
function setListAndStageOrder(element) {
  const proxyListPosition = element.state.proxyListPosition;
  const rightToLeft = element[symbols.rightToLeft];
  const listInInitialPosition =
      proxyListPosition === 'top' ||
      proxyListPosition === 'start' ||
      proxyListPosition === 'left' && !rightToLeft ||
      proxyListPosition === 'right' && rightToLeft;
  const container = element.$.explorerContainer;
  const stage = findChildContainingNode(container, element.$.stage);
  const list = findChildContainingNode(container, element.$.proxyList);
  const firstElement = listInInitialPosition ? list : stage;
  const lastElement = listInInitialPosition ? stage : list;
  if (firstElement.nextElementSibling !== lastElement) {
    element.$.explorerContainer.insertBefore(firstElement, lastElement);
  }
}


function updateAssignedProxies(element) {
  const proxySlot = element.$.proxySlot;
  const assignedProxies = proxySlot.assignedNodes({ flatten: true });
  element.setState({
    assignedProxies
  });
}


customElements.define('elix-explorer', Explorer);
export default Explorer;
