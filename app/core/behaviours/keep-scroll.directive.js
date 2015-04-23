import dispatcher from '../services/dispatcher.service';
import config from '../services/config.service';
import common from '../services/common.service';
import scrollpos from '../services/scrollpos.service';

class KeepScroll {

  constructor() {
    this.restrict = 'A';
    this.controller = KeepScrollController;
    this.controllerAs = 'keepScroll';
    this.bindToController = true;
    this.require = 'rdKeepScroll';
    this.link = KeepScrollLink.factory;
  }

  static factory() {
    return new KeepScroll();
  }
}

class KeepScrollController {

  constructor($location) {
    // current url path.
    this.path = $location.path();
  }
}

class KeepScrollLink {

  constructor(scope, element, attrs, keepScroll) {
    // setup class variables.
    this.initVars(scope, keepScroll);
    // setup event bindings.
    this.initEvents();
  }

  /**
   * Class Variables
   */

  initVars(scope, keepScroll) {
    /**
     * Angular directive scope.
     */
    this.scope = scope;

    /**
     * keepScroll directive controller.
     */
    this.keepScroll = keepScroll;

    /**
     * jQuery window object.
     */
    this.$window = $(window);
  }

  /**
   * Event Bindings
   */

  initEvents() {
    // restore on any change to the scope.
    var dispose = this.scope.$watch(_.partial(this._onRestore,
      this.keepScroll.path));
    // do not try to restore after scrolling.
    this.$window.one('scroll', dispose);

    // remember the scroll position on destroy
    this.scope.$on('$destroy', _.partial(this._onRemember,
      this.$window, this.keepScroll.path));
  }

  /**
   * Private
   */

  _onRestore(path) {
    // get the previous scroll position.
    var ypos = common.getBaconPropValue(
      common.mapBaconPropObjectKey(scrollpos.posProperty, path));

    if (ypos) {
      // scroll to the position.
      window.scrollTo(0, ypos);
    }
  }

  _onRemember($window, path) {
    // dispatch the scroll position.
    dispatcher.dispatch({
      actionType: config.actions.KEEP_SCROLL_TOP,
      scrollTop: $window.scrollTop(),
      path: path
    });
  }

  static factory(...args) {
    return new KeepScrollLink(...args);
  }
}

KeepScrollController.$inject = ['$location'];

angular
  .module('app.core')
  .directive('rdKeepScroll', KeepScroll.factory);

export default KeepScroll;
export {KeepScrollController, KeepScrollLink};
