class FirebaseService {

  constructor() {
    var id = 'vivid-torch-8442',
        url = `https://${id}.firebaseio.com`;

    this.firebase = new Firebase(url);
    this.authStream = new Bacon.Bus();
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

  unauth() {
    this.firebase.unauth();
  }

  setData(path, data) {
    if (path instanceof Array) {
      path = path.join('/');
    }

    this.firebase.child(path)
      .set(data);
  }

  onAuth() {
    return new Promise((resolve, reject) => {
      this.firebase.onAuth((authData) => {
        // notify whoever interested about the auth.
        this.authStream.push(authData);

        if (authData) {
          resolve(authData);
        } else {
          reject();
        }
      });
    });
  }

  onValue(path) {
    if (path instanceof Array) {
      path = path.join('/');
    }

    return new Promise((resolve, reject) => {
      this.firebase.child(path)
        .on('value',
          snapshot => resolve(snapshot.val()),
          errorObject => reject(errorObject));
    });
  }

  offValue(path) {
    this.firebase.child(path)
      .off('value');
  }

  get authData() {
    return this.firebase.getAuth();
  }

  static factory() {
    return new FirebaseService();
  }
}

angular
  .module('app.core')
  .factory('firebase', FirebaseService.factory);

export default FirebaseService.factory();
