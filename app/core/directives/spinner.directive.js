import loading from '../services/loading.service';

class Spinner {

  constructor() {
    this.restrict = 'E';
    this.replace = true;
    this.transclude = false;
    this.templateUrl = '/core/directives/spinner.directive.html';
    this.controller = SpinnerController;
    this.controllerAs = 'spinner';
    this.bindToController = true;
    this.link = SpinnerLink.factory;
  }

  static factory() {
    return new Spinner();
  }
}

class SpinnerController {}

class SpinnerLink {

  constructor(scope, element, attrs) {
    // setup class variables.
    this.initVars(scope, element);
    // setup event bindings.
    this.initEvents();
  }

  /**
   * Class Variables
   */

  initVars(scope, element) {
    /**
     * Angular directive scope.
     */
    this.scope = scope;

    /**
     * jQuery element to be aniamted.
     * @type {object}
     */
    this.el = element;
  }

  /**
   * Event Bindings
   */

  initEvents() {
    // after submitting a search.
    var dispose = loading.stateProperty
      .onValue(_.partial(this._onStateChange, this.el));

    // unbind on destroy.
    this.scope.$on('$destroy', dispose);
  }

  /**
   * Private
   */

  _onStateChange(el, isLoading) {
    el.toggleClass('show', isLoading);
  }

  static factory(...args) {
    return new SpinnerLink(...args);
  }
}

angular
  .module('app.core')
  .directive('rdSpinner', Spinner.factory);

export default Spinner;
export {SpinnerController, SpinnerLink};
