class FirebaseService {

  constructor() {
    var id = 'vivid-torch-8442',
        url = `https://${id}.firebaseio.com`;

    this.firebase = new Firebase(url);
  }

  authWithOAuthPopup(provider) {
    return new Promise((resolve, reject) => {
      this.firebase.authWithOAuthPopup(provider, (error, authData) => {
        if (error) {
          reject(error);
        } else {
          resolve(authData);
        }
      });
    });
  }

  static factory() {
    return new FirebaseService();
  }
}

angular
  .module('app.core')
  .factory('firebase', FirebaseService.factory);

export default FirebaseService.factory();