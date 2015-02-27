import appleApi from '../../core/services/apple.service';

class SearchService {

  constructor() {

  }

  search(term) {
    return appleApi.searchPodcast(term);
  }

  static factory() {
    return new SearchService();
  }
}

angular
  .module('app.subscribe')
  .factory('search', SearchService.factory);

export default SearchService.factory();
