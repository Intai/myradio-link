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

  initVars() {
    /**
     * Path to playlists for the current user.
     * @type {array}
     */
    this.listsPath = ['playlist', firebase.authData.uid];

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
  }

  initPublicFuncs() {
    /**
     * Add a new playlist.
     * @param {string} name
     */
    this.addList = common.chainable(_.partial(this._addList,
      this.lists));

    /**
     * Get a playlist by name.
     * @param {string} name
     */
    this.getList = _.partial(this._getList, 
      this.lists);

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
    this.sync = common.chainable(_.partial(this._sync,
      this.listsPath, this.lists));
  }

  initEvents() {
    // retrieve playlists for the current user.
    firebase.onValue(this.listsPath)
      .then(value => {
        _.extend(this.lists, value);
      });
  }

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
  .module('app.core')
  .factory('playlists', PlaylistService.factory);

export default PlaylistService.factory();
