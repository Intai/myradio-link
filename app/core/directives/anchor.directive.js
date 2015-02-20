class Anchor {

  constructor() {
    this.restrict = 'E';
    this.replace = true;
    this.transclude = true;
    this.templateUrl = '/core/directives/anchor.directive.html';
    this.controller = AnchorController;
    this.controllerAs = 'anchor';
    this.bindToController = true;
    this.require = 'rdAnimate';
    this.link = AnchorLink.factory;
    this.scope = {
        href: '@'
    };
  }

  static factory() {
    return new Anchor();
  }
}

class AnchorController {}

class AnchorLink {

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
    this.el
      // down state.
      .on('mousedown touchstart', _.partial(this._onDown, this.animate))
      // up state.
      .on('mouseup drag touchend', _.partial(this._onUp, this.animate));
  }

  /**
   * Private
   */

  _onDown(animate, e) {
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

  static factory() {
    return new AnchorLink(...arguments);
  }
}

angular
  .module('app.core')
  .directive('rdAnchor', Anchor.factory);

export {AnchorController, AnchorLink};
