import firebase from './firebase.service';

class FacebookService {

  authPopup() {
    return firebase.authWithOAuthPopup('facebook');
  }

  authRedirect() {
    return firebase.authWithOAuthRedirect('facebook');
  }

  static factory() {
    return new FacebookService();
  }
}

angular
  .module('app.core')
  .factory('facebookApi', FacebookService.factory);

export default FacebookService.factory();
