import common from '../../core/services/common.service';
import firebase from '../../core/services/firebase.service';

class PlaylistService {

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
     * Path to playlists for the current user.
     * @type {array}
     */
    this.listsPath = ['playlist'];

    /**
     * Playlists.
     * @type {object}
     */
    this.lists = {};

    /**
     * How to order playlists.
     * @type {string}
     */
    this.order = 'asc';

    /**
     * Whether playlists have been retrieved.
     * @type {bool}
     */
    this.isListsLoaded = false;
  }

  /**
   * Public
   */

  initPublicFuncs() {
    /**
     * Add a new playlist.
     * @param {string} name
     */
    this.addList = common.chainable((name) => this._addList(
      this.lists, name));

    /**
     * Get a playlist by name.
     * @param {string} name
     */
    this.getList = (name) => this._getList(
      this.lists, name);

    /**
     * Add a new episode.
     * @param {string} name
     * @param {object} episode
     */
    this.addEpisode = common.chainable((name, episode) => this._addEpisode(
      this.order, this.lists, name, episode));

    /**
     * Sort a playlist.
     * @param {string} name
     */
    this.sort = common.chainable((name) => this._sort(
      this.order, this.lists, name));

    /**
     * Synchronise playlists to server.
     */
    this.sync = common.chainable(() => this._sync(
      this.listsPath, this.lists));
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
    // path to retrieve user's playlists.
    this.listsPath = ['playlist', authData.uid];
  }

  initOnValue() {
    // retrieve playlists for the current user.
    firebase.onValue(this.listsPath)
      .then(_.bind(this.resolveOnValue, this))
      .catch(_.bind(this.catchOnValue, this));
  }

  resolveOnValue(value) {
    // if there is no playlist.
    if (_.isEmpty(value)) {
      // not non-empty.
      this._rejectOnNonEmpty();
    }
    else {
      // otherwise update the playlists
      // and notify listeners on onNonEmpty.
      _.extend(this.lists, value);
      this._resolveOnNonEmpty();
    }

    this.isListsLoaded = true;
  }

  catchOnValue() {
    // empty playlists.
    this._rejectOnNonEmpty();
    this.isListsLoaded = true;
  }

  onNonEmpty() {
    // if the playlists have been retrieved.
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

  _addList(lists, name) {
    if (!(name in lists)) {
      lists[name] = [];
    }
  }

  _getList(lists, name) {
    return (name in lists)
      ? lists[name] : [];
  }

  _addEpisode(order, lists, name, episode) {
    this._addEpisodeToList(order, this._getList(lists, name), episode);
  }

  _addEpisodeToList(order, list, episode) {
    var index = _.findLastIndex(list,
      _.partial(this._isEpisodeHigherOrder,
        order, episode));

    list.splice(index + 1, 0, episode);
  }

  _isEpisodeHigherOrder(order, episode1, episode2) {
    var timestamp1 = parseInt(episode1.timestamp, 10),
        timestamp2 = parseInt(episode2.timestamp, 10);

    // todo:
    // according to sort-before rules
    // then timestamp

    if (order === 'dsc') {
      return (timestamp1 < timestamp2);
    }

    return (timestamp1 > timestamp2);
  }

  _sort(order, lists, name) {
    this._sortList(order, this._getList(lists, name));
  }

  _sortList(order, list) {
    if (list.length > 0) {
      // empty the playlist.
      var episodes = list.splice(0, list.length);

      // add episodes back one by one to be ordered.
      var addEpisode = _.partial(this._addEpisodeToList,
        order, list);
      _.each(episodes, addEpisode, this);
    }
  }

  _sync(listsPath, lists) {
    firebase.setData(listsPath, lists);
  }

  static factory() {
    return new PlaylistService();
  }
}

angular
  .module('app.playback')
  .factory('playlists', PlaylistService.factory);

export default PlaylistService.factory();
