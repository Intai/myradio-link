import loading from '../services/loading.service';
import config from '../services/config.service'

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

class SpinnerController {

  constructor() {
    // default to be hidden.
    this.show = false;
  }
}

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
     * jQuery element.
     * @type {object}
     */
    this.el = element;

    /**
     * Timer to delay the spinner.
     * @type {integer}
     */
    this.timer = {
      id: null
    };
  }

  /**
   * Event Bindings
   */

  initEvents() {
    // after submitting a search.
    var dispose = loading.stateProperty.changes()
      .onValue(_.partial(this._onStateChange, this.scope, this.timer));

    // unbind on destroy.
    this.scope.$on('$destroy', dispose);
  }

  /**
   * Private
   */

  _onStateChange(scope, timer, isLoading) {
    if (isLoading) {
      // delay to avoid flashing the 
      // spinner on every route switch.
      clearTimeout(timer.id);
      timer.id = setTimeout(() => {
        scope.spinner.show = true;
        scope.$digest();
      }, config.numbers.SPINNER_DELAY);
    }
    // if the spinner hasn't been shown.
    else if (!scope.spinner.show) {
      // simply clear the timer.
      clearTimeout(timer.id);
      timer.id = null;
    }
    else {
      // hide the spinner.
      scope.spinner.show = false;
      scope.$digest();
    }
    
    return timer;
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
