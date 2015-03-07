import dispatcher from './dispatcher.service';
import config from './config.service';

class NavigationService {

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
     * Stream out navigation history.
     * @type {object}
     */
    this.historyStream = new Bacon.Bus();
    this.backProperty = this.historyStream
      .scan([], this._accumulate)
      .map(this._last);
    this.backProperty.onValue();
  }

  /**
   * Action Handlers
   */

  initActionHandlers() {
    // navigation action from dispatcher.
    dispatcher.register(config.actions.NAVIGATE,
      _.partial(this._navigateActionHandler,
        this.historyStream));

    // navigate-back action from dispatcher.
    dispatcher.register(config.actions.NAVIGATE_BACK,
      _.partial(this._navigateBackActionHandler,
        this.historyStream));
  }

  /**
   * Private
   */

  _accumulate(history, to) {
    // when getting a navigation object.
    if (typeof(to) === 'object' && to.href) {
      var prev = (history.length > 0)
        ? history[history.length-1]
        : null;

      // if not duplicating the previous navigation object.
      if (!prev || prev.href !== to.href) {
        // accumulate into history.
        history.push(to);
      }
    }
    // when negative one is streamed.
    else {
      // go back in history.
      history.pop();
      history.pop();
    }

    return history;
  }

  _last(history) {
    if (history.length > 0) {
      // the last navigation object.
      return history[history.length - 1];
    }

    return null;
  }

  _navigateActionHandler(historyStream, payload) {
    // navigate to an url and title.
    historyStream.push(payload.to);
  }

  _navigateBackActionHandler(historyStream) {
    // navigate back in history.
    historyStream.push(-1);
  }

  static factory() {
    return new NavigationService();
  }
}

angular
  .module('app.core')
  .factory('navigate', NavigationService.factory);

export default NavigationService.factory();
