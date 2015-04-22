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
    var [$element, $attrs, $timeout] = args;

    // setup class variables.
    this.initVars($element, $attrs);
    // setup public functions.
    this.initPublicFuncs($timeout);
    // setup a style block for padding.
    this.initStyleBlock();
  }

  /**
   * Class Variables
   */

  initVars(element, $attrs) {
    /**
     * jQuery element.
     */
    this.el = $(element);

    /**
     * Placeholder type.
     * @type {string}
     */
    this.type = $attrs.holderType;
  }

  /**
   * Public
   */

  initPublicFuncs($timeout) {
    /**
     * Update placeholder dimensions.
     */
    this.update = _.partial(this._whenFixed,
      this._update, this.el, this.type, $timeout);

    /**
     * Update placeholder height.
     * @param {object} element
     * @param {integer} height
     */
    this.updateHeight = (this.type === config.attrs.HOLDER_TYPE_PADDING)
      // use padding to create the space.
      ? _.partial(this._updatePadding, this.el)
      // use a div element.
      : _.partial(this._updateDiv, this.el);
  }

  /**
   * Style Sheet Block
   */

  initStyleBlock() {
    if (this.type === config.attrs.HOLDER_TYPE_PADDING) {
      // create a style block in html head.
      this.styleBlock = $('<style type="text/css"></style>')
        .appendTo('head');
    }
  }

  /**
   * Private
   */

  _whenFixed(callback, ...args) {
    if (args[0].css('position') === 'fixed') {
      callback.apply(this, args)
    }
  }

  _update(el, type, $timeout, expiry) {
    var height = el.outerHeight(),
        now = common.nowMs();

    if (_.isUndefined(expiry)) {
      // default to keep updating for a second.
      expiry = now + config.numbers.PLACEHOLDER_UPDATE_DURATION;
    }

    // update either padding or a div element.
    this.updateHeight(height);

    // loop recursively because
    // the height could be changing.
    if (now < expiry) {
      $timeout(_.bind(this._update, this,
        el, type, $timeout, expiry), 200);
    }
  }

  _updatePadding(el, height) {
    var className = el.prev().attr('class');

    if (className) {
      className = className
        .split(' ').join('.') ;

      // update the padding in html head.
      this.styleBlock
        .html(`.${className}{ padding-bottom: ${height}px }`);
    }
  }

  _updateDiv(el, height) {
    var placeholder = el.prev('.placeholder');

    if (placeholder.length <= 0) {
      placeholder = $('<div class="placeholder" />')
        .insertBefore(el);
    }

    placeholder.height(height);
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
