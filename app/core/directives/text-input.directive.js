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
      clearIcon: '@',
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
    this.initVars(scope, element, animate);
    // setup event bindings.
    this.initEvents();
  }

  /**
   * Class Variables
   */

  initVars(scope, element, animate) {
    /**
     * Angular directive scope.
     */
    this.scope = scope;

    /**
     * jQuery element to be aniamted.
     */
    this.el = $(element);

    /**
     * Animate directive controller.
     */
    this.animate = animate;
  }

  /**
   * Event Bindings
   */

  initEvents() {
    var input = this.el.find('input');

    input
      // focus state.
      .on('focus', _.partial(this._onFocus, this.animate, input))
      // lose focus.
      .on('blur', _.partial(this._onBlur, this.animate, input));

    // clear the text input.
    this.el.on('click', '.text-input-clear',
      _.partial(this._onClear, input));

    // unbind on destroy.
    this.scope.$on('$destroy', () => {
      input.off();
      this.el.off();
    });
  }

  /**
   * Private
   */

  _onFocus(animate, input) {
    animate
      .reset(0)
      .setReverse(false)
      .restart();

    input.siblings('.text-input-clear')
      .removeClass('has-value');
  }

  _onBlur(animate, input) {
    animate
      .setReverse(true)
      .start();

    input.siblings('label, .text-input-clear')
      .toggleClass('has-value', input.val() !== '');
  }

  _onClear(input) {
    input.val('').focus();
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
