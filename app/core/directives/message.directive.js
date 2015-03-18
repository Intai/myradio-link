import dispatcher from '../../core/services/dispatcher.service';
import config from '../../core/services/config.service';
import message from '../services/message.service';

class Message {

  constructor() {
    this.restrict = 'E';
    this.replace = true;
    this.transclude = true;
    this.templateUrl = '/core/directives/message.directive.html';
    this.controller = MessageController;
    this.controllerAs = 'message';
    this.bindToController = true;
    this.link = MessageLink.factory;
    this.scope = {
      show: '&',
      icon: '@',
      text: '@',
      label: '@'
    };
  }

  static factory() {
    return new Message();
  }
}

class MessageController {

  constructor() {
    // default to be hidden.
    this.show = !!this.show();
    // content of the message.
    this.content = {};
  }
}

class MessageLink {

  constructor(scope, element, attrs) {
    // setup class variables.
    this.initVars(scope, element);
    // setup event bindings.
    this.initEvents();
  }

  /**
   * Class Variables
   */

  initVars(scope, element) {
    /**
     * Angular directive scope.
     */
    this.scope = scope;

    /**
     * jQuery element.
     * @type {object}
     */
    this.el = $(element);
  }

  /**
   * Event Bindings
   */

  initEvents() {
    // on okay button click.
    this.el.on('click', '.message-button.okay',
      _.partial(this._onOkay, this.scope));

    // when showing or closing a message.
    var dispose = message.messageProperty.changes()
      .onValue(_.partial(this._onMessageChange, this.scope));

    // unbind on destroy.
    this.scope.$on('$destroy', () => {
      this.el.off();
      dispose();
    });
  }

  /**
   * Private
   */

  _onOkay(scope) {
    // close the message when clicking okay button.
    dispatcher.dispatch(_.extend(scope.message.content, {
      actionType: config.actions.MESSAGE_CLOSE
    }));
  }

  _onMessageChange(scope, message) {
    scope.message.show = !!message;
    scope.message.content = message;
    scope.$digest();
  }

  static factory(...args) {
    return new MessageLink(...args);
  }
}

angular
  .module('app.core')
  .directive('rdMessage', Message.factory);

export default Message;
export {MessageController, MessageLink};
