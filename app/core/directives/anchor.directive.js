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
    this.compile = AnchorCompile.factory;
    this.scope = {
        href: '@',
        implicit: '&'
    };
  }

  static factory() {
    return new Anchor();
  }
}

class AnchorController {}

class AnchorCompile {

  constructor(element, attrs, transclude) {
    // merge ng-class objects.
    attrs.ngClass = attrs.ngClass.replace(/}\s*{/g, ', ');

    return {
      post: AnchorLink.factory
    };
  }

  static factory(...args) {
    return new AnchorCompile(...args);
  }
}

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
      .on('mouseup dragend touchend', _.partial(this._onUp, this.animate));
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
    return new AnchorLink(...args);
  }
}

angular
  .module('app.core')
  .directive('rdAnchor', Anchor.factory);

export default Anchor;
export {AnchorController, AnchorCompile, AnchorLink};
