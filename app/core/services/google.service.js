import firebase from './firebase.service';

class GoogleService {

  constructor() {}

  authPopup() {
    return firebase.authWithOAuthPopup('google');
  }

  static factory() {
    return new GoogleService();
  }
}

angular
  .module('app.core')
  .factory('google', GoogleService.factory);

export default GoogleService.factory();
