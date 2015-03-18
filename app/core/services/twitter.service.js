import firebase from './firebase.service';

class TwitterService {

  authPopup() {
    return firebase.authWithOAuthPopup('twitter');
  }

  authRedirect() {
    return firebase.authWithOAuthRedirect('twitter');
  }

  static factory() {
    return new TwitterService();
  }
}

angular
  .module('app.core')
  .factory('twitterApi', TwitterService.factory);

export default TwitterService.factory();
