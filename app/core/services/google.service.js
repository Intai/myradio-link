class GoogleService {

  constructor(firebase) {
    this.firebase = firebase;
  }

  authPopup() {
    this.firebase.authWithOAuthPopup('google')
      .then(authData => {})
      .catch(error => {});
  }

  static factory(firebase) {
    return new GoogleService(firebase);
  }
}

GoogleService.factory.$inject = ['firebase'];

angular
  .module('app.core')
  .factory('google', GoogleService.factory);
