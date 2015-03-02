import config from '../../core/services/config.service';

class SearchController {

  constructor($routeParams) {
    // playlist name from url or defaults.
    this.listName = $routeParams.list || config.defaults.PLAYLIST;
  }
}

SearchController.$inject = ['$routeParams'];

angular
  .module('app.subscribe')
  .controller('SearchController', SearchController);

export default SearchController;
