import Vec from '../libs/math/vector';
import Mtx from '../libs/math/matrix';
import config from '../services/config.service';
import common from '../services/common.service';

class SlideReveal {

  constructor() {
    this.restrict = 'A';
    this.controller = SlideRevealController;
    this.controllerAs = 'reveal';
    this.bindToController = true;
    this.link = SlideRevealLink.factory;
    this.require = ['rdPan', 'rdMatrix', '?^rdSubscriptionItem', '?^rdGroup'];
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
    // setup class variables.
    this.initVars(scope, element, ...controllers);
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

  initVars(scope, element, pan, matrix, wrap, group) {
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
     * Subscription item controller.
     * @type {object}
     */
    this.wrap = wrap;

    /**
     * Group directive controller.
     * @type {object}
     */
    this.group = group;

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
    var disposes = [];

    if (this.wrap) {
      // reveal or hide from the wrapper.
      disposes.push(this.wrap.revealStream.onValue(
        _.partial(this._onReveal, this.pan)));
    }

    if (this.group) {
      // on touch start, slide others to hide.
      this.el.on('touchstart', _.partial(this._onTouchStart, this.group));

      // hide when revealing another in the same group.
      disposes.push(this.group.messageStream.onValue(
        _.partial(this._onGroupMessage, this.pan)));
    }

    // unbind on destroy.
    this.scope.$on('$destroy', () => {
      this.el.off();
      common.execute(disposes);
    });
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

  _onTouchStart(group) {
    // notify other members in the group.
    group.broadcast(config.enums.MSG_UNSHIFT);
  }

  _onReveal(pan, reveal) {
    if (reveal) {
      pan.shift();
    } else {
      pan.unshift();
    }
  }

  _onGroupMessage(pan, post) {
    // if focusing on another member in the group.
    if (post.message === config.enums.MSG_UNSHIFT) {
      // slide to hide.
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
