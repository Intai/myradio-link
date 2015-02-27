import firebase from './firebase.service';

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
