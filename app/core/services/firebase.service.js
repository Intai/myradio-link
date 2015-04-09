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

  authWithOAuthRedirect(provider) {
    return new Promise((resolve, reject) => {
      this.firebase.authWithOAuthRedirect(provider, (error) => {
        if (error) {
          reject(error);
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

  getValueStream(path, defaultValue) {
    if (path instanceof Array) {
      path = path.join('/');
    }

    // stream value from firebase.
    var valueStream = new Bacon.Bus();
    // split between success and error.
    var returnStream = valueStream.flatMap((object) => {
      if ('value' in object) {
        return (object.value)
          ? object.value : defaultValue;
      }
      else {
        return Bacon.Error(object.error);
      }
    });

    // listen to the firebase path specified.
    this.firebase.child(path).on('value',
      snapshot => valueStream.push({
        value: snapshot.val()}),
      errorObject => valueStream.push({
        error: errorObject}));

    return returnStream;
  }

  offValueStream(path) {
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
