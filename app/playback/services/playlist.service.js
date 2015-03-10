import dispatcher from '../../core/services/dispatcher.service';
import common from '../../core/services/common.service';
import config from '../../core/services/config.service';
import firebase from '../../core/services/firebase.service';

class PlaylistService {

  constructor() {
    // setup class variables.
    this.initVars();
    // setup public functions.
    this.initPublicFuncs();
    // setup event bindings.
    this.initEvents();
    // setup action handlers.
    this.initActionHandlers();
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
     * Stream out playlists.
     * @type {bacon.bus}
     */
    this.listsStream = new Bacon.Bus();
    this.listsProperty = this.listsStream.scan(null, common.accumulateInObject);
    this.listsProperty.onValue();

    /**
     * Stream out error when retrieving playlists.
     * @type {bacon.bus}
     */
    this.errorStream = new Bacon.Bus();
    this.errorProperty = this.errorStream.toProperty(null);
    this.errorProperty.onValue();

    /**
     * Stream out current playlist name.
     * @type {bacon.bus}
     */
    this.currentStream = new Bacon.Bus();
    this.currentProperty = this.currentStream.toProperty(null);
    this.currentProperty.onValue();

    /**
     * Stream out additional episodes for the current playlist.
     * @type {bacon.bus}
     */
    this.episodesStream = new Bacon.Bus();
    this.episodesProperty = this.episodesStream.scan([], common.accumulateInArray);
    this.episodesProperty.onValue();

    /**
     * Stream out the current playlist.
     * @type {bacon.bus}
     */
    this.mergedListsProperty = Bacon.combineTemplate({
      lists: this.listsProperty.filter(_.isObject),
      current: this.currentProperty.filter(_.isString),
      episodes: this.episodesProperty
    })
    // combine the current playlist
    // with additional episodes.
    .map(this._mergeEpisodes);
  }

  /**
   * Public
   */

  initPublicFuncs() {
    /**
     * Add a new playlist.
     * @param {string} name
     */
    this.addList = common.chainable(_.partial(this._addList,
      this.listsStream));

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
      .catch(_.partial(this._pushStreamValue, this.errorStream));
  }

  initListsPath(authData) {
    // path to retrieve user's playlists.
    this.listsPath = ['playlist', authData.uid];
  }

  initOnValue() {
    // retrieve playlists for the current user.
    firebase.onValue(this.listsPath)
      .then(_.partial(this._pushStreamValue, this.listsStream))
      .catch(_.partial(this._pushStreamValue, this.errorStream));

    // whenever playlists changed, sync back to server.
    this.mergedListsProperty.onValue(
      _.partial(this._sync, this.listsPath));
  }

  /**
   * Action Handlers
   */

  initActionHandlers() {
    // action to add an espisode from dispatcher.
    dispatcher.register(config.actions.FEED_ADD_EPISODE,
      _.partial(this._addEpisodeActionHandler,
        this.episodesStream));
  }

  /**
   * Route Resolves
   */

  routeResolveCurrent($route) {
    // playlist name from url path or defaults.
    var name = $route.current.pathParams.list || config.defaults.PLAYLIST;
    this.currentStream.push(name);
  }

  onNonEmpty() {
    // wait for lists to be retrieved.
    return new Promise((resolve, reject) => {
      // resolve if not empty. reject otherwise.
      this.listsProperty.filter(_.isObject)
        .take(1).onValue((lists) => {
          common.callIfElse(_.isEmpty(lists), reject, resolve);
        });

      // reject on error.
      this.errorProperty.filter(_.isObject)
        .take(1).onValue(reject);
    });
  }

  /**
   * Private
   */

  _pushStreamValue(stream, value) {
    stream.push(value);
  }

  _addEpisodeActionHandler(episodesStream, payload) {
    episodesStream.push(payload.episode);
  }

  _mergeEpisodes(template) {
    var lists = template.lists,
        name = template.current,
        episodes = template.episodes,
        list = (name in lists) ? lists[name] : {};

    // list may be newly created.
    lists[name] = list;

    // merge the current list with additional episodes.
    var concat = (list.entries || []).concat(episodes);
    list.entries = _.uniq(concat, _.iteratee('link'));

    return lists;
  }

  _addList(listsStream, name) {
    listsStream.push({
      [name]: {}
    });
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
    if (!_.isEmpty(lists)) {
      firebase.setData(listsPath, lists);
    }
  }

  static factory() {
    return new PlaylistService();
  }
}

angular
  .module('app.playback')
  .factory('playlists', PlaylistService.factory);

export default PlaylistService.factory();
