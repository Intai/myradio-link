import dispatcher from '../services/dispatcher.service';
import config from '../services/config.service';

class ResetScroll {

  constructor() {
    this.restrict = 'A';
    this.controller = ResetScrollController;
    this.controllerAs = 'ResetScroll';
    this.bindToController = true;
    this.link = ResetScrollLink.factory;
  }

  static factory() {
    return new ResetScroll();
  }
}

class ResetScrollController {}

class ResetScrollLink {

  constructor(scope, element, attrs) {
    // setup class variables.
    this.initVars(scope, element, attrs);
    // setup event bindings.
    this.initEvents();
  }

  /**
   * Class Variables
   */

  initVars(scope, element, attrs) {
    /**
     * Angular directive scope.
     */
    this.scope = scope;

    /**
     * jQuery element.
     */
    this.el = $(element);

    /**
     * Element attributes.
     */
    this.attrs = attrs;
  }

  /**
   * Event Bindings
   */

  initEvents() {
    this.el.on('click vclick', _.partial(
      this._onClearScroll, this.attrs));

    // unbind on destroy.
    this.scope.$on('$destroy', () => this.el.off());
  }

  /**
   * Private
   */

  _onClearScroll(attrs) {
    dispatcher.dispatch({
      actionType: config.actions.KEEP_SCROLL_CLEAR,
      path: attrs.href
    });
  }

  static factory(...args) {
    return new ResetScrollLink(...args);
  }
}

angular
  .module('app.core')
  .directive('rdResetScroll', ResetScroll.factory);

export default ResetScroll;
export {ResetScrollController, ResetScrollLink};
