import dispatcher from '../../core/services/dispatcher.service';
import config from '../../core/services/config.service';
import common from '../../core/services/common.service';

class MessageService {

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
     * Stream out messages.
     * @type {bacon.bus}
     */
    this.messageStream = new Bacon.Bus();
    this.messageProperty = this.messageStream
      .scan([], this._accumulate)
      .map(_.last);
  }

  /**
   * Action Handlers
   */

  initActionHandlers() {
    var pushActionTypes = [
      config.actions.MESSAGE,
      config.actions.MESSAGE_CLOSE];

    // register action types to show or close a message.
    dispatcher.register(pushActionTypes,
      _.partial(this._pushActionHandler,
        this.messageStream));
  }

  /**
   * Private
   */

  _accumulate(messages, message) {
    // if adding a message.
    if (message.actionType === config.actions.MESSAGE) {
      // push the message itself down bacon stream.
      delete message.actionType;
      messages.push(message);
    }
    // if closing a message.
    else {
      delete message.actionType;

      // remove the last occurrence of the message.
      var index = _.findLastIndex(messages, _.matcher(message));
      if (index >= 0) {
        messages.splice(index, 1);
      }
    }

    return messages;
  }

  _pushActionHandler(messageStream, payload) {
    // push payload down the message stream
    // to be processed while scanning.
    messageStream.push(payload);
  }

  static factory() {
    return new MessageService();
  }
}

angular
  .module('app.core')
  .factory('message', MessageService.factory);

export default MessageService.factory();
