import googleApi from '../../core/services/google.service';

class SubscribeService {

  constructor() {

  }

  subscribe(url) {

  }

  update(url) {
    return googleApi.loadFeedsApi()
      .then(this._loadFeed);
  }

  _loadFeed(url) {
    return new Promise((resolve, reject) => {
      var feed = new google.feeds.Feed(url);

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
    return new SubscribeService();
  }
}

angular
  .module('app.subscribe')
  .factory('subscribe', SubscribeService.factory);

export default SubscribeService.factory();
