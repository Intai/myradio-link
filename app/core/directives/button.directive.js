class Button {

  constructor() {
    this.restrict = 'E';
    this.replace = true;
    this.transclude = true;
    this.templateUrl = '/core/directives/button.directive.html';
    this.controller = ButtonController;
    this.controllerAs = 'button';
    this.bindToController = true;
    this.require = 'rdAnimate';
    this.link = ButtonLink.factory;
    this.scope = {
      highlight: '&'
    };
  }

  static factory() {
    return new Button();
  }
}

class ButtonController {}

class ButtonLink {

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
     * jQuery element.
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
    this.el
      // down state.
      .on('mousedown touchstart', _.partial(this._onDown, this.animate))
      // up state.
      .on('mouseup drag touchend', _.partial(this._onUp, this.animate));

    // unbind on destroy.
    this.scope.$on('$destroy', () => {
      this.el.off();
    });
  }

  /**
   * Private
   */

  _onDown(animate) {
    animate
      .reset(0)
      .setReverse(false)
      .restart();
  }

  _onUp(animate) {
    animate
      .setReverse(true)
      .start();
  }

  static factory(...args) {
    return new ButtonLink(...args);
  }
}

angular
  .module('app.core')
  .directive('rdButton', Button.factory);

export default Button;
export {ButtonController, ButtonLink};
