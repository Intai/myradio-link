import firebase from './firebase.service';

class GoogleService {

  constructor() {}

  authPopup() {
    firebase.authWithOAuthPopup('google')
      .then(authData => {})
      .catch(error => {});
  }

  static factory() {
    return new GoogleService();
  }
}

angular
  .module('app.core')
  .factory('google', GoogleService.factory);

export default GoogleService.factory();
