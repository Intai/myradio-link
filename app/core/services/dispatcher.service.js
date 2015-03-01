class DispatcherService {

  constructor() {
    // setup class variables.
    this.initVars();
    // setup public functions.
    this.initPublicFuncs();
  }

  /**
   * Class Variables
   */

  initVars() {
    /**
     * Queue of dispatched payloads.
     * @type {array}
     */
    this.queue = [];

    /**
     * Action handlers for payloads.
     * @type {array}
     */
    this.listeners = [];
  }

  /**
   * Public
   */

  initPublicFuncs() {
    /**
     * Dispatch a payload into queue.
     * @param {object}
     */
    this.dispatch = _.partial(this._dispatch,
      this.queue, this.listeners);

    /**
     * Register an action handler.
     * @param {string} actionType
     * @param {function} handler
     */
    this.register = _.partial(this._register,
      this.listeners);
  }

  /**
   * Private
   */

  _dispatch(queue, listeners, payload) {
    // push a payload to action queue.
    queue.push(payload);
    // process the queue in the next loop.
    this._deferProcess(queue, listeners);
  }

  _register(listeners, actionType, handler) {
    // register an action handler.
    listeners.push({
      actionType,
      handler
    });
  }

  _process(queue, listeners) {
    // notify all action handlers about the payload.
    this._trigger(listeners, queue.shift());
    // if there are more payloads.
    if (queue.length > 0) {
      // continue in the next loop.
      this._deferProcess(queue, listeners);
    }
  }

  _deferProcess(queue, listeners) {
    // process the next payload in the next loop.
    _.defer(() => this._process(queue, listeners));
  }

  _trigger(listeners, payload) {
    // loop through action handlers.
    _.each(listeners, (listener) => {
      var {actionType, handler} = listener;

      // if the action type matches.
      if (payload.actionType === actionType) {
        // trigger the action handler.
        handler(payload);
      }
    });
  }

  static factory() {
    return new DispatcherService();
  }
}

angular
  .module('app.core')
  .factory('dispatcher', DispatcherService.factory);

export default DispatcherService.factory();
