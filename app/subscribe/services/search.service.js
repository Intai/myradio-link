import dispatcher from '../../core/services/dispatcher.service';
import appleApi from '../../core/services/apple.service';
import config from '../../core/services/config.service';

class SearchService {

  constructor() {
    // setup action handlers.
    this.initActionHandlers();
  }

  /**
   * Action Handlers
   */

  initActionHandlers() {
    // search podcast action from dispatcher.
    dispatcher.register(config.actions.SEARCH_PODCAST,
      this._searchActionHandler);
  }

  /**
   * Private
   */

  _searchActionHandler(payload) {
    
  }

  _search(term) {
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
