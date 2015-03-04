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
    // search podcast action from dispatcher.
    dispatcher.register(config.actions.SEARCH_PODCAST,
      _.partial(this._showActionHandler,
        this.stateStream));

    // search results action from dispatcher.
    dispatcher.register(config.actions.SEARCH_PODCAST_RESULTS,
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
    // extract search term from action payload.
    stateStream.push(1);
  }

  _hideActionHandler(stateStream) {
    // extract search term from action payload.
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
