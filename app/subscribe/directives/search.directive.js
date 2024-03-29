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
      var {results} = common.getBaconPropValue(search.resultProperty);
      this.feeds = results || [];
    }
  }
}

class SearchFormLink {

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
    this.el = $(element);
  }

  /**
   * Event Bindings
   */

  initEvents() {
    this.el
      // on search term submission.
      .on('submit.search', _.partial(this._onSubmit,
        this.scope));

    // after restrieving search result.
    var dispose = search.resultStream
      .onValue(_.partial(this._onResult,
        this.scope));

    // unbind on destroy.
    this.scope.$on('$destroy', () => {
      this.el.off('submit.search');
      dispose();
    });
  }

  /**
   * Private
   */

  _onSubmit(scope, e) {
    var form = $(e.target),
        input = form.find('input:first'),
        [{value}] = form.serializeArray();

    if (value) {
      // dispatch the search term submitted.
      dispatcher.dispatch({
        actionType: config.actions.SEARCH_PODCAST,
        searchTerm: value
      });

      // clear search result currently rendered.
      var feeds = scope.form.feeds;
      feeds.splice(0, feeds.length);
      scope.$digest();
    }

    // close software keyboard.
    input.blur();
    // stop browser from submitting the form.
    e.preventDefault();
  }

  _onResult(scope, data) {
    // dispatch the search results.
    dispatcher.dispatch({
      actionType: config.actions.SEARCH_PODCAST_RESULTS,
      results: data.results
    });

    if (data.results) {
      // update search result.
      var feeds = scope.form.feeds;
      feeds.splice(0, feeds.length, ...data.results);
      scope.$digest();
    }
    else {
      // dispatch the search error.
      dispatcher.dispatch({
        actionType: config.actions.MESSAGE,
        error: config.errors.SEARCH_ITUNES
      });
    }
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
