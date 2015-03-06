import dispatcher from '../../core/services/dispatcher.service';
import googleApi from '../../core/services/google.service';
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
     * Stream out search terms.
     * @type {object}
     */
    this.dataStream = new Bacon.Bus();
    this.dataProperty = this.dataStream
      .scan([], this._accumulate);
    this.dataProperty.onValue();
  }

  /**
   * Public
   */

  initPublicFuncs() {
    /**
     * Get a bacon property of feed data for the specified url.
     */
    this.getDataPropertyByUrl = _.partial(this._getDataPropertyByUrl,
      this.dataProperty);
  }

  /**
   * Action Handlers
   */

  initActionHandlers() {
    // search podcast action from dispatcher.
    dispatcher.register(config.actions.FEED_DATA,
      _.bind(_.partial(this._dataActionHandler,
        this.dataStream), this));
  }

  /**
   * Private
   */

  _accumulate(array, data) {
    // accumulate feed data into an array.
    array.push(data);

    return history;
  }

  _getDataPropertyByUrl(dataProperty, url) {
    return dataProperty.map(
      _.partial(this._getDataByUrl, url));
  }

  _getDataByUrl(url, array) {
    for (let data of array) {
      if (data.link === url) {
        return data;
      }
    }

    return null;
  }

  _dataActionHandler(dataStream, payload) {
    // extract feed url from action payload.
    this._loadFeedData(dataStream, payload.url);
  }

  _loadFeedData(dataStream, url) {
    // load the feed through google api.
    googleApi.loadFeedData(url)
      // push feed data out through the bacon bus.
      .then((data) => dataStream.push(data));
  }

  static factory() {
    return new FeedService();
  }
}

angular
  .module('app.subscribe')
  .factory('feed', FeedService.factory);

export default FeedService.factory();
