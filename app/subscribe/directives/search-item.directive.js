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
    this.feed.feedUrlBase64 = escape(btoa(this.feed.feedUrl));
  }
}

class SearchItemLink {

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
      // down state.
      .on('mousedown touchstart', _.partial(this._onDown, this.animate))
      // up state.
      .on('mouseup drag touchend', _.partial(this._onUp, this.animate));
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
