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
    var dispose = this.attrs
      .$observe('href', this._onClearScroll);

    // unbind on destroy.
    this.scope.$on('$destroy', dispose);
  }

  /**
   * Private
   */

  _onClearScroll(href) {
    dispatcher.dispatch({
      actionType: config.actions.KEEP_SCROLL_CLEAR,
      path: href
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
