import config from '../services/config.service';
import common from '../services/common.service';

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

  initPublicFuncs(element, $attrs, $timeout) {
    /**
     * Update placeholder dimensions.
     */
    this.update = _.partial(this._update,
      $(element), $attrs, $timeout);
  }

  /**
   * Private
   */

  _update(el, $attrs, $timeout, expiry) {
    var type = $attrs.holderType,
        height = el.outerHeight(),
        now = common.nowMs();

    if (_.isUndefined(expiry)) {
      // default to keep updating for a second.
      expiry = now + config.numbers.PLACEHOLDER_UPDATE_DURATION;
    }

    // use padding to create the space.
    if (type === config.attrs.HOLDER_TYPE_PADDING) {
      el.prev().css('padding-bottom', height);
    }
    else {
      // use a div element.
      var placeholder = el.prev('.placeholder');
      if (placeholder.length <= 0) {
        placeholder = $('<div class="placeholder" />')
          .insertBefore(el);
      }

      placeholder.height(height);
    }

    // loop recursively because 
    // the height could be changing.
    if (now < expiry) {
      $timeout(_.bind(this._update, this,
        el, $attrs, $timeout, expiry), 200);
    }
  }
}

class PlaceholderLink {

  constructor(scope, element, attrs, controllers) {
    // setup class variables.
    this.initVars(...controllers);
    // setup placeholder before the element.
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
    // update with the target element's initial height. 
    this.placeholder.update();
  }

  static factory(...args) {
    return new PlaceholderLink(...args);
  }
}

PlaceholderController.$inject = ['$element', '$attrs', '$timeout'];

angular
  .module('app.core')
  .directive('rdPlaceholder', Placeholder.factory);

export default Placeholder;
export {PlaceholderController, PlaceholderLink};
