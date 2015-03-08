import dispatcher from '../../core/services/dispatcher.service';
import googleApi from '../../core/services/google.service';
import appleApi from '../../core/services/apple.service';
import common from '../../core/services/common.service';
import config from '../../core/services/config.service';

class FeedService {

  constructor() {
    // setup class variables.
    this.initVars();
    // setup public functions.
    this.initPublicFuncs();
    // setup action handlers.
    this.initActionHandlers();
  }

  /**
   * Class Variables
   */

  initVars() {
    /**
     * Stream out feed data.
     * @type {object}
     */
    this.dataStream = new Bacon.Bus();
    this.dataProperty = this.dataStream
      .scan([], common.accumulateInArray);
    this.dataProperty.onValue();

    /**
     *
     * Stream out feed details.
     * @type {Bacon}
     */
    this.infoStream = new Bacon.Bus();
    this.infoProperty = this.infoStream
      .scan([], common.accumulateInArray);
    this.infoProperty.onValue();
  }

  /**
   * Public
   */

  initPublicFuncs() {
    /**
     * Get a bacon property of feed data for the specified url.
     * @param {string} url
     */
    this.getDataPropertyByUrl = _.partial(common.mapBaconPropArrayWhere,
      this.dataProperty, 'feedUrl');

    /**
     * Get a bacon property of feed information by url..
     * @param {string} url
     */
    this.getInfoPropertyByUrl = _.partial(common.mapBaconPropArrayWhere,
      this.infoProperty, 'feedUrl');
  }

  /**
   * Action Handlers
   */

  initActionHandlers() {
    // action from dispatcher to load feed data.
    dispatcher.register(config.actions.FEED_LOAD_DATA,
      _.bind(_.partial(this._loadDataActionHandler,
        this.dataStream), this));

    // action from dispatcher to load feed information.
    dispatcher.register(config.actions.FEED_LOAD_INFO,
      _.bind(_.partial(this._loadInfoActionHandler,
        this.infoStream), this));

    // action from dispatcher to push feed information.
    dispatcher.register(config.actions.FEED_PUSH_INFO,
      _.partial(this._pushInfoActionHandler,
        this.infoStream));
  }

  /**
   * Private
   */

  _loadDataActionHandler(dataStream, payload) {
    // extract feed url from action payload.
    this._loadFeedData(dataStream, payload.url);
  }

  _loadFeedData(dataStream, url) {
    // load the feed through google api.
    googleApi.loadFeedData(url)
      // push feed data out through the bacon bus.
      .then((data) => dataStream.push(data));
  }

  _loadInfoActionHandler(infoStream, payload) {
    // extract feed title from action payload.
    this._loadFeedInfo(infoStream, payload.title);
  }

  _loadFeedInfo(infoStream, title) {
    // search for podcasts on itunes.
    appleApi.searchPodcast(title)
      // push result out through the bacon bus.
      .then((data) => infoStream.push(data.results));
  }

  _pushInfoActionHandler(infoStream, payload) {
    if (payload.info) {
      // stream out the feed info specified.
      infoStream.push(payload.info);
    }
  }

  static factory() {
    return new FeedService();
  }
}

angular
  .module('app.subscribe')
  .factory('feed', FeedService.factory);

export default FeedService.factory();
