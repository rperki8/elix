import { merge } from "./updates";
import FilterListBox from "./FilterListBox.js";
import ListComboBox from "./ListComboBox.js";


class FilterComboBox extends ListComboBox {

  get defaultState() {
    return Object.assign({}, super.defaultState, {
      listRole: FilterListBox
    });
  }

  refineState(state) {
    let result = super.refineState ? super.refineState(state) : true;
    const valueChanged = state.value !== this.state.value;
    const selectedIndexChanged = state.selectedIndex !== this.state.selectedIndex;
    const openedChanged = typeof this.state.opened !== 'undefined' &&
        state.opened !== this.state.opened;
    const selectedItem = state.items && state.items[state.selectedIndex];
    const selectedItemText = selectedItem && selectedItem.textContent;
    if (valueChanged && !selectedIndexChanged && state.selectedIndex >= 0) {
      // Changing the value directly resets the selection.
      state.selectedIndex = -1;
      result = false;
    } else if (openedChanged && !state.opened && 
        selectedItemText && state.value !== selectedItemText) {
      // When user closes combo box, update value and reset selection.
      Object.assign(state, {
        selectedIndex: -1,
        value: selectedItemText
      });
      result = false;
    }
    return result;
  }

  get updates() {
    const filter = this.state.value;
    return merge(super.updates, {
      $: {
        list: {
          filter
        }
      }
    });
  }

}


export default FilterComboBox;
customElements.define('elix-filter-combo-box', FilterComboBox);
