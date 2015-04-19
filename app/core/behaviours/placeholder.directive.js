class Placeholder {

  constructor() {
    this.restrict = 'A';
    this.controller = PlaceholderController;
    this.controllerAs = 'placeholder';
    this.bindToController = true;
    this.require = ['rdPlaceholder'];
    this.link = PlaceholderLink.factory;
  }

  static factory() {
    return new Placeholder();
  }
}

class PlaceholderController {

  constructor(...args) {
    // setup public functions.
    this.initPublicFuncs(...args);
  }

  /**
   * Public
   */

  initPublicFuncs($element, $timeout) {
    var el = $($element);

    /**
     * Update placeholder dimensions.
     */
    this.update = _.partial(this._update, el);

    /**
     * Defer update after inserted into dom.
     */
    this.deferUpdate = _.partial(this._deferUpdate,
      $timeout, this.update);
  }

  /**
   * Private
   */

  _deferUpdate($timeout, update) {
    $timeout(update);
  }

  _update(el) {
    var placeholder = el.prev('.placeholder'),
        height = el.outerHeight();

    if (el.prev().css('position') !== 'absolute') {
      placeholder = $('<div class="placeholder" />')
        .insertBefore(el);
    }

    if (placeholder.length > 0) {
      placeholder.height(height);
    } else {
      el.prev().css('padding-bottom', height);
    }
  }
}

class PlaceholderLink {

  constructor(scope, element, attrs, controllers) {
    // setup class variables.
    this.initVars(...controllers);
    // setup placeholder div before the element.
    this.initPlaceholder();
  }

  /**
   * Class Variables
   */

  initVars(placeholder) {
    /**
     * Placeholder controller.
     */
    this.placeholder = placeholder;
  }

  /**
   * Initialise Placeholder
   */

  initPlaceholder() {
    this.placeholder.deferUpdate();
  }

  static factory(...args) {
    return new PlaceholderLink(...args);
  }
}

PlaceholderController.$inject = ['$element', '$timeout'];

angular
  .module('app.core')
  .directive('rdPlaceholder', Placeholder.factory);

export default Placeholder;
export {PlaceholderController, PlaceholderLink};
