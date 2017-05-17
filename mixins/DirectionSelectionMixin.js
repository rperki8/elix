import symbols from './symbols.js';


/**
 * Mixin which maps direction semantics (goLeft, goRight, etc.) to selection
 * semantics (selectPrevious, selectNext, etc.).
 *
 * This mixin can be used in conjunction with
 * [KeyboardDirectionMixin](KeyboardDirectionMixin) (which maps keyboard
 * events to directions) and a mixin that handles selection like
 * [SingleSelectionMixin](SingleSelectionMixin).
 *
 * @module DirectionSelectionMixin
 */
export default function DirectionSelectionMixin(Base) {

  // The class prototype added by the mixin.
  class DirectionSelection extends Base {

    [symbols.goDown]() {
      if (super[symbols.goDown]) { super[symbols.goDown](); }
      if (!this.selectNext) {
        console.warn(`DirectionSelectionMixin expects a component to define a "selectNext" method.`);
        return false;
      } else {
        return this.selectNext();
      }
    }

    [symbols.goEnd]() {
      if (super[symbols.goEnd]) { super[symbols.goEnd](); }
      if (!this.selectLast) {
        console.warn(`DirectionSelectionMixin expects a component to define a "selectLast" method.`);
        return false;
      } else {
        return this.selectLast();
      }
    }

    [symbols.goLeft]() {
      if (super[symbols.goLeft]) { super[symbols.goLeft](); }
      if (!this.selectPrevious) {
        console.warn(`DirectionSelectionMixin expects a component to define a "selectPrevious" method.`);
        return false;
      } else {
        return this.selectPrevious();
      }
    }

    [symbols.goRight]() {
      if (super[symbols.goRight]) { super[symbols.goRight](); }
      if (!this.selectNext) {
        console.warn(`DirectionSelectionMixin expects a component to define a "selectNext" method.`);
        return false;
      } else {
        return this.selectNext();
      }
    }

    [symbols.goStart]() {
      if (super[symbols.goStart]) { super[symbols.goStart](); }
      if (!this.selectFirst) {
        console.warn(`DirectionSelectionMixin expects a component to define a "selectFirst" method.`);
        return false;
      } else {
        return this.selectFirst();
      }
    }

    [symbols.goUp]() {
      if (super[symbols.goUp]) { super[symbols.goUp](); }
      if (!this.selectPrevious) {
        console.warn(`DirectionSelectionMixin expects a component to define a "selectPrevious" method.`);
        return false;
      } else {
        return this.selectPrevious();
      }
    }

  }

  return DirectionSelection;
}