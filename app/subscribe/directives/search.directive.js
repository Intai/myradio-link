class SearchForm {

  constructor() {
    this.restrict = 'E';
    this.replace = true;
    this.transclude = false;
    this.templateUrl = '/subscribe/directives/search.directive.html';
    this.controller = SearchFormController;
    this.controllerAs = 'form';
    this.bindToController = true;
    this.require = 'rdAnimate';
    this.link = SearchFormLink.factory;
  }

  static factory() {
    return new SearchForm();
  }
}

class SearchFormController {}

class SearchFormLink {

  constructor(scope, element, attrs, animate) {
    // setup class variables.
    this.initVars(element, animate);
    // setup event bindings.
    this.initEvents();
  }

  /**
  * Class Variables
  */

  initVars(element, animate) {
    /**
    * jQuery element to be aniamted.
    * @type {object}
    */
    this.el = element;

    /**
    * Animate directive controller.
    * @type {object}
    */
    this.animate = animate;
  }

  /**
  * Event Bindings
  */

  initEvents() {
    this.el
      // on search term submission.
      .on('submit', _.partial(this._onSubmit, this.animate));
  }

  /**
  * Private
  */

  _onSubmit(animate, e) {
    var form = $(e.target),
        [{'value': value}] = form.serializeArray();

    // todo
    // dispatch value as search term
    //
  }

  static factory(...args) {
    return new SearchFormLink(...args);
  }
}

angular
  .module('app.subscribe')
  .directive('rdSearchForm', SearchForm.factory);

export default SearchForm;
export {SearchFormController, SearchFormLink};
