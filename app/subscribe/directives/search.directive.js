import dispatcher from '../../core/services/dispatcher.service';
import config from '../../core/services/config.service';
import common from '../../core/services/common.service';
import search from '../services/search.service';

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
    this.scope = {
      term: '@',
      feeds: '@'
    };
  }

  static factory() {
    return new SearchForm();
  }
}

class SearchFormController {

  constructor() {
    // if there is no search term specified.
    if (!this.term) {
      // get the current search term.
      this.term = common.getBaconPropValue(search.termProperty);
    }

    if (!this.feeds) {
      // get the current search result.
      this.feeds = common.getBaconPropValue(search.resultProperty);
    }
  }
}

class SearchFormLink {

  constructor(scope, element, attrs, animate) {
    // setup class variables.
    this.initVars(scope, element, animate);
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

    // after restrieving search result.
    search.resultStream
      .onValue(_.partial(this._onResult, 
        this.animate, this.scope));
  }

  /**
   * Private
   */

  _onSubmit(animate, e) {
    var form = $(e.target),
        [{value}] = form.serializeArray();

    if (value) {
      // dispatch the search term submitted.
      dispatcher.dispatch({
        actionType: config.actions.SEARCH_PODCAST,
        searchTerm: value
      });
    }
  }

  _onResult(animate, scope, data) {
    scope.$apply(() => {
      // update search result.
      var feeds = scope.form.feeds;
      feeds.splice(0, feeds.length, ...data.results);
    });
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
