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
    this.subscriptionsProperty = this.subscriptionsStream.scan(null, common.accumulateInObject);
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
    this.currentProperty = this.currentStream.toProperty(null);
    this.currentProperty.onValue();

    /**
     * Stream out additional feeds for the current subscription.
     * @type {bacon.bus}
     */
    this.feedsStream = new Bacon.Bus();
    this.feedsProperty = this.feedsStream.scan([], common.accumulateInArray);
    this.feedsProperty.onValue();

    /**
     * Stream out the current subscription.
     * @type {bacon.bus}
     */
    this.mergedSubscriptionsProperty = Bacon.combineTemplate({
      subscriptions: this.subscriptionsProperty.filter(_.isObject),
      current: this.currentProperty.filter(_.isString),
      feeds: this.feedsProperty
    })
    // combine the current subscription
    // with additional feeds.
    .map(this._mergeFeeds);
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
      .catch(_.partial(this._pushStreamValue, this.errorStream));
  }

  initListsPath(authData) {
    // path to retrieve user's subscription lists.
    this.listsPath = ['subscription', authData.uid];
  }

  initOnValue() {
    // retrieve playlists for the current user.
    firebase.onValue(this.listsPath)
      .then(_.partial(this._pushStreamValue, this.subscriptionsStream))
      .catch(_.partial(this._pushStreamValue, this.errorStream));

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
    return new Promise((resolve, reject) => {
      // resolve if not empty. reject otherwise.
      this.subscriptionsProperty.filter(_.isObject)
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

  _subscribeActionHandler(feedsStream, payload) {
    feedsStream.push(payload.feedInfo);
  }

  _mergeFeeds(template) {
    var lists = template.subscriptions,
        name = template.current,
        feeds = template.feeds,
        list = (name in lists) ? lists[name] : [];

    // merge the current subsciption with additional feeds.
    var concat = (list || []).concat(feeds);
    lists[name] = _.uniq(concat, _.iteratee('feedUrl'));

    return lists;
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
