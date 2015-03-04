class TextInput {

  constructor() {
    this.restrict = 'E';
    this.replace = true;
    this.transclude = true;
    this.templateUrl = '/core/directives/text-input.directive.html';
    this.controller = TextInputController;
    this.controllerAs = 'input';
    this.bindToController = true;
    this.require = 'rdAnimate';
    this.link = TextInputLink.factory;
    this.scope = {
      type: '@',
      name: '@',
      value: '@',
      required: '@',
      placeholder: '@',
      autocomplete: '@',
      icon: '@'
    };
  }

  static factory() {
    return new TextInput();
  }
}

class TextInputController {

  constructor() {
    // default to text input.
    this.type = this.type || 'text';
    // don't autocomplete by default.
    this.autocomplete = this.autocomplete || 'off';
  }
}

class TextInputLink {

  constructor(scope, element, attrs, animate) {
    // setup class variables.
    this.initVars(element, animate);
    // setup event bindings.
    this.initEvents();
  }

  /**
   * Class Variables
   */

  initVars(element, animate) {
    /**
     * jQuery element to be aniamted.
     * @type {object}
     */
    this.el = element;

    /**
     * Animate directive controller.
     * @type {object}
     */
    this.animate = animate;
  }

  /**
   * Event Bindings
   */

  initEvents() {
    this.el.find('input')
      // focus state.
      .on('focus', _.partial(this._onFocus, this.animate))
      // lose focus.
      .on('blur', _.partial(this._onBlur, this.animate));
  }

  /**
   * Private
   */

  _onFocus(animate) {
    animate
      .reset(0)
      .setReverse(false)
      .restart();
  }

  _onBlur(animate, e) {
    var input = $(e.target);

    animate
      .setReverse(true)
      .start();

    input.siblings('label')
      .toggleClass('has-value', input.val() !== '');
  }

  static factory(...args) {
    return new TextInputLink(...args);
  }
}

angular
  .module('app.core')
  .directive('rdTextInput', TextInput.factory);

export default TextInput;
export {TextInputController, TextInputLink};
