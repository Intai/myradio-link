import dispatcher from '../../core/services/dispatcher.service';
import common from '../../core/services/common.service';
import config from '../../core/services/config.service';
import firebase from '../../core/services/firebase.service';
import googleApi from '../../core/services/google.service';

class SubscribeService {

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

    /**
     * Stream out subscription lists.
     * @type {bacon.bus}
     */
    this.subscriptionsStream = new Bacon.Bus();
    this.subscriptionsProperty = this.subscriptionsStream
      .skipDuplicates(_.isEqual)
      .toProperty(null);
    this.subscriptionsProperty.onValue();

    /**
     * Stream out error when retrieving subscriptions.
     * @type {bacon.bus}
     */
    this.errorStream = new Bacon.Bus();
    this.errorProperty = this.errorStream.toProperty(null);
    this.errorProperty.onValue();

    /**
     * Stream out current subscription name.
     * @type {bacon.bus}
     */
    this.currentStream = new Bacon.Bus();
    this.currentProperty = this.currentStream.toProperty(null).skipDuplicates();
    this.currentProperty.onValue();

    /**
     * Stream out additional feeds for the current subscription.
     * @type {bacon.bus}
     */
    this.feedsStream = new Bacon.Bus();
    this.feedsProperty = this.feedsStream.scan(
      {add: [], remove: []}, _.bind(this._accumulateFeeds, this));
    this.feedsProperty.onValue();

    /**
     * Stream out the current subscription.
     * @type {bacon.bus}
     */
    this.templateProperty = Bacon.combineTemplate({
      subscriptions: this.subscriptionsProperty.skip(1),
      current: this.currentProperty.filter(_.isString),
      feeds: this.feedsProperty
    });
    // combine the current subscription
    // with additional feeds.
    this.mergedSubscriptionsProperty = this.templateProperty.map(this._mergeFeeds);
    // combine then return the current subscription list.
    this.currentListProperty = this.templateProperty
      .doAction(this._mergeFeeds)
      .map(this._mapToCurrent);
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
    firebase.authStream.filter(_.isObject).take(1)
      .map(_.bind(this.initListsPath, this))
      .onValue(_.bind(this.initOnValue, this));
  }

  initListsPath(authData) {
    // path to retrieve user's subscription lists.
    this.listsPath = ['subscription', authData.uid];
  }

  initOnValue() {
    // retrieve playlists for the current user.
    var valueStream = firebase.getValueStream(this.listsPath);
    valueStream.onValue(_.partial(this._pushStreamValue, this.subscriptionsStream));
    valueStream.onError(_.partial(this._pushStreamValue, this.errorStream));

    // whenever subscriptions changed, sync back to server.
    this.mergedSubscriptionsProperty.onValue(
      _.partial(this._sync, this.listsPath));
  }

  /**
   * Action Handlers
   */

  initActionHandlers() {
    // action to add a podcast feed from dispatcher.
    dispatcher.register(config.actions.FEED_SUBSCRIBE,
      _.partial(this._subscribeActionHandler,
        this.feedsStream));

    // action to add a podcast feed from dispatcher.
    dispatcher.register(config.actions.FEED_UNSUBSCRIBE,
      _.partial(this._unsubscribeActionHandler,
        this.feedsStream));
  }

  /**
   * Route Resolves
   */

  routeResolveCurrent($route) {
    // subscription name from url path or defaults.
    var name = $route.current.pathParams.list || config.defaults.PLAYLIST;
    this.currentStream.push(name);
  }

  onNonEmpty() {
    // wait for subscription lists to be retrieved.
    return new Promise(common.flip(
      _.bind(this._onEmpty, this)));
  }

  onEmpty() {
    return new Promise(
      _.bind(this._onEmpty, this));
  }

  /**
   * Private
   */

  _onEmpty(resolve, reject) {
    // resolve if not empty. reject otherwise.
    this.currentListProperty.filter(_.isArray)
      .take(1).onValue((list) => {
        common.callIfElse(_.isEmpty(list), resolve, reject);
      });

    // reject on error.
    this.errorProperty.filter(_.isObject)
      .take(1).onValue(reject);
  }

  _pushStreamValue(stream, value) {
    stream.push(value);
  }

  _subscribeActionHandler(feedsStream, payload) {
    feedsStream.push({add: payload.feedInfo});
  }

  _unsubscribeActionHandler(feedsStream, payload) {
    feedsStream.push({remove: payload.feedInfo});
  }

  _accumulateFeeds(object, data) {
    object = this._accumulateFeedsTo('add', object, data);
    object = this._accumulateFeedsTo('remove', object, data);

    return object;
  }

  _accumulateFeedsTo(action, object, data) {
    if (data[action]) {
      // accumulate into the target object uniquely.
      var concat = object[action].concat(data[action]);
      object[action] = _.uniq(concat, _.iteratee('feedUrl'));

      // remove from the opposite action.
      var opposite = (action === 'add') ? 'remove' : 'add';
      object[opposite] = _.filter(object[opposite],
        _.negate(_.matcher({feedUrl: data[action].feedUrl})));
    }

    return object;
  }

  _mergeFeeds(template) {
    var lists = template.subscriptions || {},
        name = template.current,
        feeds = template.feeds,
        list = (name in lists) ? lists[name] : [];

    // merge the current subsciption with additional feeds.
    var concat = (list || []).concat(feeds.add);
    lists[name] = _.uniq(concat, _.iteratee('feedUrl'));

    // feeds to be removed from the current list.
    if (feeds.remove.length > 0) {
      lists[name] = _.filter(lists[name], (feed) => {
        return !_.findWhere(feeds.remove, {feedUrl: feed.feedUrl});
      });
    }

    return lists;
  }

  _mapToCurrent(template) {
    var lists = template.subscriptions || {},
        name = template.current;

    // return the current subscription list or an empty array.
    return lists[name] || [];
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

  _sync(listsPath, lists) {
    if (!_.isEmpty(lists)) {
      firebase.setData(listsPath, lists);
    }
  }

  static factory() {
    return new SubscribeService();
  }
}

angular
  .module('app.subscribe')
  .factory('subscribe', SubscribeService.factory);

export default SubscribeService.factory();
