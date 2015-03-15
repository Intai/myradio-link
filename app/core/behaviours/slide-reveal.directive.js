import Mtx from '../libs/math/matrix';

class SlideReveal {

  constructor() {
    this.restrict = 'A';
    this.controller = SlideRevealController;
    this.controllerAs = 'reveal';
    this.bindToController = true;
    this.link = SlideRevealLink.factory;
    this.require = 'rdMatrix';
  }

  static factory() {
    return new SlideReveal();
  }
}

class SlideRevealController {

  constructor($attrs) {
    // class name of the content to be revealed.
    this.content = $attrs.revealContent;
  }
}

class SlideRevealLink {

  constructor(scope, element, attrs, matrix) {
    // setup class variables.
    this.initVars(scope, element, matrix);
    // setup boundary matrix.
    this.initBoundary(matrix);
  }

  /**
   * Class Variables
   */

  initVars(scope, element, matrix) {
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
     * Matrix directive controller.
     * @type {object}
     */
    this.matrix = matrix;
  }

  /**
   * Boundary Matrices
   */

  initBoundary() {
    var className = this.scope.reveal.content,
        content = this.el.siblings(`.${className}`),
        width = content.width();

    if (width) {
      // add a boundary matrix to reveal the hidden content.
      this.matrix.addBoundaryMatrix(
        Mtx.create().translate([-width, 0]));
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
