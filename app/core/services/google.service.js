class GoogleService {

  constructor(firebase) {
    this.firebase = firebase;
  }

  authPopup() {
    this.firebase.authWithOAuthPopup('google')
      .then(authData => {})
      .catch(error => {});
  }

  static factory() {
    return new GoogleService(...arguments);
  }
}

GoogleService.factory.$inject = ['firebase'];

angular
  .module('app.core')
  .factory('google', GoogleService.factory);
