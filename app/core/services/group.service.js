import dispatcher from '../services/dispatcher.service';
import config from '../services/config.service';

class GroupService {

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
     * Stream out group messages.
     * @type {object}
     */
    this.messageStream = new Bacon.Bus();
  }

  /**
   * Action Handlers
   */

  initActionHandlers() {
    // register action type to broadcast a message.
    dispatcher.register(config.actions.GROUP_BROADCAST,
      _.partial(this._broadcastActionHandler,
        this.messageStream));
  }

  /**
   * Private
   */

  _broadcastActionHandler(messageStream, payload) {
    var message = _.pick(payload, 'groupKey', 'message');
    messageStream.push(message);
  }

  static factory() {
    return new GroupService();
  }
}

angular
  .module('app.core')
  .factory('group', GroupService.factory);

export default GroupService.factory();
