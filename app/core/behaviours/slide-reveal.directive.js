import Vec from '../libs/math/vector';
import Mtx from '../libs/math/matrix';

class SlideReveal {

  constructor() {
    this.restrict = 'A';
    this.controller = SlideRevealController;
    this.controllerAs = 'reveal';
    this.bindToController = true;
    this.link = SlideRevealLink.factory;
    this.require = ['?^rdSubscriptionItem', 'rdPan', 'rdMatrix'];
  }

  static factory() {
    return new SlideReveal();
  }
}

class SlideRevealController {

  constructor($attrs) {
    // class name of the content to be revealed.
    this.content = $attrs.revealContent;
    // group of hidden contents.
    this.group = $attrs.revealGroup;
  }
}

class SlideRevealLink {

  constructor(scope, element, attrs, controllers) {
    var [wrap, pan, matrix] = controllers;

    // setup class variables.
    this.initVars(scope, element, wrap, pan, matrix);
    // setup event bindings.
    this.initEvents();
    // setup boundary matrix.
    this.initBoundary();
    // setup reveal direction.
    this.initPanVector();
  }

  /**
   * Class Variables
   */

  initVars(scope, element, wrap, pan, matrix) {
    /**
     * Angular directive scope.
     */
    this.scope = scope;

    /**
     * jQuery element.
     * @type {object}
     */
    this.el = $(element);

    /**
     * Subscription item controller.
     * @type {object}
     */
    this.wrap = wrap;

    /**
     * Pan directive controller.
     * @type {object}
     */
    this.pan = pan;

    /**
     * Matrix directive controller.
     * @type {object}
     */
    this.matrix = matrix;

    /**
     * Width of the hidden conten.
     * @type {integer}
     */
    var className = scope.reveal.content,
        content = this.el.siblings(`.${className}`);
    this.revealWidth = content.width();
  }

  /**
   * Event Bindings
   */

  initEvents() {
    if (this.wrap) {
      // reveal or hide from the wrapper.
      var dispose = this.wrap.revealStream.onValue(
        _.partial(this._onReveal, this.pan));

      // unbind on destroy.
      this.scope.$on('$destroy', () => dispose());
    }
  }

  /**
   * Boundary Matrices
   */

  initBoundary() {
    if (this.revealWidth) {
      // add a boundary matrix to reveal the hidden content.
      this.matrix.addBoundaryMatrix(
        Mtx.create().translate([-this.revealWidth, 0]));
    }
  }

  initPanVector() {
    if (this.revealWidth) {
      // assign a shift vector to reveal the hidden content.
      this.pan.shiftVector = Vec.create([-this.revealWidth, 0]);
    }
  }

  /**
   * Private
   */

  _onReveal(pan, reveal) {
    if (reveal) {
      pan.shift();
    } else {
      pan.unshift();
    }
  }

  static factory(...args) {
    return new SlideRevealLink(...args);
  }
}

SlideRevealController.$inject = ['$attrs'];

angular
  .module('app.core')
  .directive('rdSlideReveal', SlideReveal.factory);

export default SlideReveal;
export {SlideRevealController, SlideRevealLink};
