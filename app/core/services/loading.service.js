import dispatcher from '../../core/services/dispatcher.service';
import config from '../../core/services/config.service';

class LoadingService {

  constructor() {
    // setup class variables.
    this.initVars();
    // setup action handlers.
    this.initActionHandlers();
  }

  /**
   * Class Variables
   */

  initVars() {
    /**
     * Stream out loading state.
     * @type {object}
     */
    this.stateStream = new Bacon.Bus();
    this.stateProperty = this.stateStream
      .scan(0, this._accumulate)
      .map(this._isLoading);
  }

  /**
   * Action Handlers
   */

  initActionHandlers() {
    // action types to indicate loading from dispatcher.
    var showActionTypes = [
      config.actions.ROUTE_START,
      config.actions.SEARCH_PODCAST,
      config.actions.FEED_LOAD];

    // action types to finish loading from dispatcher.
    var hideActionTypes = [
      config.actions.ROUTE_COMPLETE,
      config.actions.SEARCH_PODCAST_RESULTS,
      config.actions.FEED_LOAD_RESULTS];

    // register action types to indicate loading.
    dispatcher.register(showActionTypes,
      _.partial(this._showActionHandler,
        this.stateStream));

    // register action types to finish loading.
    dispatcher.register(hideActionTypes,
      _.partial(this._hideActionHandler,
        this.stateStream));
  }

  /**
   * Private
   */

  _accumulate(state1, state2) {
    return state1 + state2;
  }

  _isLoading(state) {
    return state > 0;
  }

  _showActionHandler(stateStream) {
    stateStream.push(1);
  }

  _hideActionHandler(stateStream) {
    stateStream.push(-1);
  }

  static factory() {
    return new LoadingService();
  }
}

angular
  .module('app.core')
  .factory('loading', LoadingService.factory);

export default LoadingService.factory();
