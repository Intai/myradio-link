class SearchItem {

  constructor() {
    this.restrict = 'E';
    this.replace = true;
    this.transclude = false;
    this.templateUrl = '/subscribe/directives/search-item.directive.html';
    this.controller = SearchItemController;
    this.controllerAs = 'item';
    this.bindToController = true;
    this.scope = {
      feed: '='
    };
  }

  static factory() {
    return new SearchItem();
  }
}

class SearchItemController {

  constructor() {
    // encode feed url to base64.
    this.feed.feedUrlBase64 = escape(btoa(this.feed.feedUrl));
  }
}

angular
  .module('app.subscribe')
  .directive('rdSearchItem', SearchItem.factory);

export default SearchItem;
export {SearchItemController};
