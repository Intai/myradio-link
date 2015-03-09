import firebase from './firebase.service';
import config from './config.service';

class GoogleService {

  loadApi(name, version) {
    return new Promise((resolve, reject) => {
      google.load(name, version, {
        callback: resolve
      });
    });
  }

  loadFeedsApi() {
    return this.loadApi('feeds', '1');
  }

  loadFeedData(url) {
    return new Promise((resolve, reject) => {
      // create google feed for the url specified.
      var feed = new google.feeds.Feed(url);
      // set maximum number of feed entreies.
      feed.setNumEntries(config.numbers.FEED_MAX_ENTRIES);
      // load the feed through google api.
      feed.load((result) => {
        if (result.error) {
          reject(result.error);
        } else {
          resolve(result.feed);
        }
      });
    });
  }

  authPopup() {
    return firebase.authWithOAuthPopup('google');
  }

  static factory() {
    return new GoogleService();
  }
}

angular
  .module('app.core')
  .factory('googleApi', GoogleService.factory);

export default GoogleService.factory();
