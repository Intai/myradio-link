class VClick {

  constructor() {
    this.restrict = 'A';
    this.controller = VClickController;
    this.controllerAs = 'vclick';
    this.bindToController = true;
    this.link = VClickLink.factory;
  }

  static factory() {
    return new VClick();
  }
}

class VClickController {

  constructor(...args) {
    // setup public functions.
    this.initPublicFuncs(...args);
  }

  /**
  * Public
  */

  initPublicFuncs($scope, $location, $attrs) {
    /**
     * Redirect to href.
     */
    this.setPath = _.partial(this._setPath,
      $scope, $location, $attrs);
  }

  /**
   * Private
   */

  _setPath($scope, $location, $attrs) {
    if ($attrs.href) {
      $location.path($attrs.href);
      $scope.$apply();

      return true;
    }

    return false;
  }
}

class VClickLink {

  constructor(scope, element, attrs) {
    // setup class variables.
    this.initVars(scope, element);
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
    this.el = $(element);

    /**
     * Current state of the vclick.
     * @type {object}
     */
    this.state = {
      /**
       * Track touch events.
       */
      prevTouchId: false,
      cntMoves: 0
    };
  }

  /**
   * Event Bindings
   */

  initEvents() {
    var element = this.el.get(0);

    var onTouchStart = _.partial(
      this._onTouchStart, this.state);
    var onTouchMove = _.partial(
      this._onTouchMove, this.state);
    var onTouchEnd = _.partial(
      this._onTouchEnd, this.scope, this.el, this.state);

    // listen to touch events.
    element.addEventListener('mousedown', onTouchStart, false);
    element.addEventListener('touchmove', onTouchMove, false);
    element.addEventListener('touchend', onTouchEnd, false);

    // unbind on destroy.
    this.scope.$on('$destroy', () => {
      element.removeEventListener('touchstart', onTouchStart);
      element.removeEventListener('touchmove', onTouchMove);
      element.removeEventListener('touchend', onTouchEnd);
    });
  }

  /**
   * Private
   */

  _onTouchStart(state, e) {
    var touch = e.touches[0],
        touchIdentifier = touch.identifier;

    // reset on touch start.
    state.prevTouchId = touchIdentifier;
    state.cntMoves = 0;
  }

  _onTouchMove(state, e) {
    state.cntMoves ++;
  }

  _onTouchEnd(scope, el, state, e) {
    if (state.cntMoves <= 0) {
      // update location path to href.
      if (!scope.vclick.setPath()) {
        // if there is no href, trigger vclick event.
        el.trigger('vclick');
      }

      // avoid click event.
      e.preventDefault();
    }
  }

  static factory(...args) {
    return new VClickLink(...args);
  }
}

VClickController.$inject = ['$scope', '$location', '$attrs'];

angular
  .module('app.core')
  .directive('rdVclick', VClick.factory);

export default VClick;
export {VClickController, VClickLink};
