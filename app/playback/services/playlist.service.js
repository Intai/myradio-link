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
     * How to order playlists.
     * @type {string}
     */
    this.order = 'asc';

    /**
     * Stream out playlists.
     * @type {bacon.bus}
     */
    this.listsStream = new Bacon.Bus();
    this.listsProperty = this.listsStream
      .skipDuplicates(_.isEqual)
      .scan(null, common.accumulateInObject);
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
    this.currentProperty = this.currentStream.toProperty(null).skipDuplicates();
    this.currentProperty.onValue();

    /**
     * Stream out the episode being played.
     * @type {bacon.bus}
     */
    this.playingStream = new Bacon.Bus();
    this.playingProperty = this.playingStream.toProperty(null);
    this.playingProperty.onValue();

    /**
     * Stream out additional episodes for the current playlist.
     * @type {bacon.bus}
     */
    this.episodesStream = new Bacon.Bus();
    this.episodesProperty = this.episodesStream.scan(
      {add: [], remove: []}, _.bind(this._accumulateEpisodes, this));
    this.episodesProperty.onValue();

    /**
     * Stream out the current playlist.
     * @type {bacon.bus}
     */
    this.templateProperty = Bacon.combineTemplate({
      lists: this.listsProperty.filter(_.isObject),
      current: this.currentProperty.filter(_.isString),
      playing: this.playingProperty,
      episodes: this.episodesProperty
    });
    // combine the current playlist
    // with additional episodes.
    this.mergedTemplateProperty = this.templateProperty
      .doAction(this._updatePlaying)
      .doAction(this._mergeEpisodes);
    // combine then return all playlists.
    this.mergedListsProperty = this.mergedTemplateProperty
      .map(this._mapToLists);
    // combine then return the current playlist.
    this.currentListProperty = this.mergedTemplateProperty
      .map(this._mapToCurrent);
    // return the episode being played.
    this.playbackProperty = this.currentListProperty
      .map(this._mapToPlayback);
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
     * Get a bacon property of episode for the specified url.
     * @param {string} url
     */
    this.getEpisodePropertyByUrl = _.partial(common.mapBaconPropArrayWhere,
      this.currentListProperty.map(_.property('entries')), 'link');
  }

  /**
   * Event Bindings
   */

  initEvents() {
    // after authenticated.
    firebase.authStream.filter(_.isObject).take(1)
      .map(_.bind(this.initListsPath, this))
      .onValue(_.bind(this.initOnValue, this));
  }

  initListsPath(authData) {
    // path to retrieve user's playlists.
    this.listsPath = ['playlist', authData.uid];
  }

  initOnValue() {
    // retrieve playlists for the current user.
    var valueStream = firebase.getValueStream(this.listsPath);
    valueStream.onValue(_.partial(this._pushStreamValue, this.listsStream));
    valueStream.onError(_.partial(this._pushStreamValue, this.errorStream));

    // whenever playlists changed, sync back to server.
    this.mergedListsProperty.onValue(
      _.partial(this._sync, this.listsPath));
  }

  /**
   * Action Handlers
   */

  initActionHandlers() {
    // action from dispatcher to add an espisode.
    dispatcher.register(config.actions.FEED_ADD_EPISODE,
      _.partial(this._addEpisodeActionHandler,
        this.episodesStream));

    // action to remove an espisode.
    dispatcher.register(config.actions.FEED_REMOVE_EPISODE,
      _.partial(this._removeEpisodeActionHandler,
        this.episodesStream));

    // action to play an espisode.
    dispatcher.register(config.actions.FEED_PLAY_EPISODE,
      _.partial(this._playEpisodeActionHandler,
        this.playingStream));

    // action to stop playback.
    dispatcher.register(config.actions.PLAYBACK_STOP,
      _.partial(this._stopEpisodeActionHandler,
        this.playingStream));
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
      this.currentListProperty.filter(_.isObject)
        .take(1).onValue((list) => {
          common.callIfElse(_.isEmpty(list.entries), reject, resolve);
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
    episodesStream.push({add: payload.episode});
  }

  _removeEpisodeActionHandler(episodesStream, payload) {
    episodesStream.push({remove: payload.episode});
  }

  _playEpisodeActionHandler(playingStream, payload) {
    playingStream.push({episode: payload.episode});

    // avoid multiple devices trying to set
    // different episodes as playing endlessly.
    playingStream.push(null);
  }

  _stopEpisodeActionHandler(playingStream) {
    playingStream.push({episode: null});
    playingStream.push(null);
  }

  _accumulateEpisodes(object, data) {
    object = this._accumulateEpisodesTo('add', object, data);
    object = this._accumulateEpisodesTo('remove', object, data);

    return object;
  }

  _accumulateEpisodesTo(action, object, data) {
    if (data[action]) {
      // accumulate into the target object uniquely.
      var concat = object[action].concat(data[action]);
      object[action] = _.uniq(concat, _.iteratee('link'));

      // remove from the opposite action.
      var opposite = (action === 'add') ? 'remove' : 'add';
      object[opposite] = _.filter(object[opposite],
        _.negate(_.matcher({link: data[action].link})));
    }

    return object;
  }

  _updatePlaying(template) {
    var lists = template.lists,
        name = template.current,
        playing = template.playing,
        list = (name in lists) ? lists[name] : null;

    if (playing && list) {
      // get the episode being played.
      let episode = playing.episode;
      // flag the episode as playing.
      list.entries = _.map(list.entries, (entry) => {
        if (episode && entry.link === episode.link) {
          entry.playing = true;
        } else {
          delete entry.playing;
        }
        return entry;
      });
    }
  }

  _mergeEpisodes(template) {
    var lists = template.lists,
        name = template.current,
        episodes = template.episodes,
        list = (name in lists) ? lists[name] : {};

    // list may be newly created.
    lists[name] = list;

    // merge the current list with additional episodes.
    var concat = (list.entries || []).concat(episodes.add);
    list.entries = _.uniq(concat, _.iteratee('link'));

    // episodes to be removed from the current list.
    if (episodes.remove.length > 0) {
      list.entries = _.filter(list.entries, (episode) => {
        return !_.findWhere(episodes.remove, {link: episode.link});
      });
    }
  }

  _mapToLists(template) {
    return template.lists;
  }

  _mapToCurrent(template) {
    // return the current playlist or an empty object.
    return template.lists[template.current] || {};
  }

  _mapToPlayback(list) {
    return _.findWhere(list.entries, {playing: true});
  }

  _addList(listsStream, name) {
    listsStream.push({
      [name]: {}
    });
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
