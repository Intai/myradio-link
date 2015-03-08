import dispatcher from '../../core/services/dispatcher.service';
import config from '../../core/services/config.service';

class SearchItem {

  constructor() {
    this.restrict = 'E';
    this.replace = true;
    this.transclude = false;
    this.templateUrl = '/subscribe/directives/search-item.directive.html';
    this.controller = SearchItemController;
    this.controllerAs = 'item';
    this.bindToController = true;
    this.require = 'rdAnimate';
    this.link = SearchItemLink.factory;
    this.scope = {
      feed: '='
    };
  }

  static factory() {
    return new SearchItem();
  }
}

class SearchItemController {

  constructor($location) {
    // url path to add a subscription feed.
    this.addFeedPath = $location.path().replace(
      /\/subscription\/add(\/init)?$/i, '/subscription/add-feed');
    // encode feed url to base64.
    this.feed.feedUrlBase64 = encodeURIComponent(btoa(this.feed.feedUrl));
    // encode feed title to base64.
    this.feed.feedTitleBase64 = encodeURIComponent(btoa(encodeURIComponent(this.feed.trackName)));
  }
}

class SearchItemLink {

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
      // down state.
      .on('mousedown touchstart', _.partial(this._onDown, this.animate))
      // up state.
      .on('mouseup drag touchend', _.partial(this._onUp, this.animate))
      // when selecting the podcast feed.
      .on('click', _.partial(this._onClick, this.scope));
  }

  /**
   * Private
   */

  _onDown(animate) {
    animate
      .reset(0)
      .setReverse(false)
      .restart();
  }

  _onUp(animate) {
    animate
      .setReverse(true)
      .start();
  }

  _onClick(scope) {
    // dispatch to push the selected feed.
    dispatcher.dispatch({
      actionType: config.actions.FEED_PUSH_INFO,
      info: scope.item.feed
    });
  }

  static factory(...args) {
    return new SearchItemLink(...args);
  }
}

SearchItemController.$inject = ['$location'];

angular
  .module('app.subscribe')
  .directive('rdSearchItem', SearchItem.factory);

export default SearchItem;
export {SearchItemController, SearchItemLink};
