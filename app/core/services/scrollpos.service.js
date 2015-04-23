import dispatcher from '../services/dispatcher.service';
import config from '../services/config.service';

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
    // register action type to keep scroll positions.
    dispatcher.register(config.actions.KEEP_SCROLL_TOP,
      _.partial(this._keepActionHandler,
        this.posStream));
  }

  /**
   * Private
   */

  _accumulatePos(accum, payload) {
    accum[payload.path] = payload.scrollTop;
    return accum;
  }

  _keepActionHandler(posStream, payload) {
    posStream.push(payload);
  }

  static factory() {
    return new ScrollPosService();
  }
}

angular
  .module('app.core')
  .factory('scrollpos', ScrollPosService.factory);

export default ScrollPosService.factory();
