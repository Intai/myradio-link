import dispatcher from '../services/dispatcher.service';
import config from '../services/config.service';
import browser from '../services/browser.service';

class ScrollPosService {

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
     * Stream out scroll positions.
     * @type {object}
     */
    this.posStream = new Bacon.Bus();
    this.posProperty = this.posStream.scan({}, this._accumulatePos);
    this.posProperty.onValue();
  }

  /**
   * Action Handlers
   */

  initActionHandlers() {
    var keepActionTypes = [
      config.actions.KEEP_SCROLL_TOP,
      config.actions.KEEP_SCROLL_CLEAR];

    // register action type to keep/clear scroll position.
    dispatcher.register(keepActionTypes,
      _.partial(this._keepActionHandler, this.posStream));

    // register action type to restore scroll position.
    dispatcher.register(config.actions.KEEP_SCROLL_RESTORE,
      this._restoreActionHandler);

    // scroll back to top on route complete.
    dispatcher.register(config.actions.ROUTE_COMPLETE,
      this._resetActionHandler);
  }

  /**
   * Private
   */

  _accumulatePos(accum, payload) {
    if (payload.path) {
      if (payload.scrollTop) {
        accum[payload.path] = payload.scrollTop;
      } else {
        delete accum[payload.path];
      }
    }

    return accum;
  }

  _keepActionHandler(posStream, payload) {
    posStream.push(payload);
  }

  _restoreActionHandler(payload) {
    browser.animateScrollTo(payload.scrollTop);
  }

  _resetActionHandler() {
    browser.animateScrollTo(0);
  }

  static factory() {
    return new ScrollPosService();
  }
}

angular
  .module('app.core')
  .factory('scrollpos', ScrollPosService.factory);

export default ScrollPosService.factory();
