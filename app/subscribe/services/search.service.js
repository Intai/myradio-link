import config from '../../core/services/config.service';
import googleApi from '../../core/services/google.service';

class SearchService {

  constructor() {

  }

  search(term) {
    return googleApi.loadFeedsApi()
      .then(_loadFeed);
  }

  _loadFeed(term) {
    return new Promise((resolve, reject) => {
      var url = config.urls.ITUNES_SEARCH + term,
          feed = new google.feeds.Feed(url);

      feed.load(result => {
        if (result.error) {
          reject(result.error);
        } else {
          resolve(result);
        }
      });
    });
  }

  static factory() {
    return new SearchService();
  }
}

angular
  .module('app.subscribe')
  .factory('search', SearchService.factory);

export default SearchService.factory();
