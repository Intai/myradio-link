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
    this.path = ['playlist', firebase.authData.uid];

    /**
     * Playlists.
     * @type {object}
     */
    this.data = {};
  }

  initPublicFuncs() {
    /**
     * Synchronise playlists to server.
     * @type {[type]}
     */
    this.sync = common.chainable(_.partial(this._sync,
      this.path, this.data));
  }

  initEvents() {
    // retrieve playlists for the current user.
    firebase.onValue(this.path)
      .then(value => {
        _.extend(this.data, value);
      });
  }

  _getList(data, name) {
    return (name in data)
      ? data[name] : [];
  }

  _addEpisode(data, episode) {

  }

  _sort(data) {

  }

  _sync(path, data) {
    firebase.setData(path, data);
  }

  static factory() {
    return new PlaylistService();
  }
}

angular
  .module('app.core')
  .factory('playlist', PlaylistService.factory);

export default PlaylistService.factory();
