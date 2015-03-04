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
    var disposes = [],
        onShow = _.partial(this._onShow, this.el),
        onHide = _.partial(this._onHide, this.el);

    // after submitting a search.
    disposes.push(search.submitStream
      .onValue(onShow));

    // after restrieving search result.
    disposes.push(search.resultStream
      .onValue(onHide));

    // unbind on destroy.
    this.scope.$on('$destroy', _.compose(...disposes));
  }

  /**
   * Private
   */

  _onShow(el) {
    el.addClass('show');
  }

  _onHide(el) {
    el.removeClass('show');
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
