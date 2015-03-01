import googleApi from '../../core/services/google.service';
import firebase from '../../core/services/firebase.service';

class SubscribeService {

  constructor() {
    // setup class variables.
    this.initVars();
    // setup public functions.
    this.initPublicFuncs();
    // setup event bindings.
    this.initEvents();
  }

  /**
   * Class Variables
   */

  initVars() {
    /**
     * Path to subscription lists for the current user.
     * @type {array}
     */
    this.listsPath = ['subscription'];

    /**
     * Subscription lists.
     * @type {object}
     */
    this.lists = {};

    /**
     * Whether subscription lists have been retrieved.
     * @type {bool}
     */
    this.isListsLoaded = false;
  }

  /**
   * Public
   */

  initPublicFuncs() {

  }

  /**
   * Event Bindings
   */

  initEvents() {
    // after authenticated.
    firebase.onAuth()
      .then(_.bind(this.initListsPath, this))
      .then(_.bind(this.initOnValue, this))
      .catch(_.bind(this.catchOnValue, this));
  }

  initListsPath(authData) {
    // path to retrieve user's subscription lists.
    this.listsPath = ['subscription', authData.uid];
  }

  initOnValue() {
    // retrieve playlists for the current user.
    firebase.onValue(this.listsPath)
      .then(_.bind(this.resolveOnValue, this))
      .catch(_.bind(this.catchOnValue, this));
  }

  resolveOnValue(value) {
    // if there is no subscription.
    if (_.isEmpty(value)) {
      // not non-empty.
      this._rejectOnNonEmpty();
    }
    else {
      // otherwise update the subscription lists
      // and notify listeners on onNonEmpty.
      _.extend(this.lists, value);
      this._resolveOnNonEmpty();
    }

    this.isListsLoaded = true;
  }

  catchOnValue() {
    // empty subscription lists.
    this._rejectOnNonEmpty();
    this.isListsLoaded = true;
  }

  onNonEmpty() {
    // if the subscription lists have been retrieved.
    if (this.isListsLoaded) {
      // return a resolved promise if not empty.
      return (_.isEmpty(this.lists))
        ? Promise.reject()
        : Promise.resolve();
    }

    // wait for lists to be retrieved.
    return new Promise((resolve, reject) => {
      this._resolveOnNonEmpty = _.compose(this._resolveOnNonEmpty, resolve);
      this._rejectOnNonEmpty = _.compose(this._rejectOnNonEmpty, reject);
    });
  }

  /**
   * Private
   */

  _resolveOnNonEmpty() {}

  _rejectOnNonEmpty() {}

  _subscribe(url) {

  }

  _update(url) {
    return googleApi.loadFeedsApi()
      .then(this._loadFeed);
  }

  _loadFeed(url) {
    return new Promise((resolve, reject) => {
      var feed = new google.feeds.Feed(url);

      feed.load(result => {
        if (result.error) {
          reject(result.error);
        } else {
          resolve(result);
        }
      });
    });
  }

  static factory() {
    return new SubscribeService();
  }
}

angular
  .module('app.subscribe')
  .factory('subscribe', SubscribeService.factory);

export default SubscribeService.factory();
