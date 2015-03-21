import dispatcher from '../../core/services/dispatcher.service';
import config from '../../core/services/config.service';
import common from '../../core/services/common.service';
import subscribe from '../services/subscribe.service';

class Subscription {

  constructor() {
    this.restrict = 'E';
    this.replace = true;
    this.transclude = false;
    this.templateUrl = '/subscribe/directives/subscription.directive.html';
    this.controller = SubscriptionController;
    this.controllerAs = 'subscription';
    this.bindToController = true;
    this.link = SubscriptionLink.factory;
    this.scope = {};
  }

  static factory() {
    return new Subscription();
  }
}

class SubscriptionController {

  constructor() {
    // current list of subscriptions.
    this.list = common.getBaconPropValue(subscribe.currentListProperty);
  }
}

class SubscriptionLink {

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
    this.el = element;
  }

  /**
   * Event Bindings
   */

  initEvents() {
    // when subscription list is loaded.
    var dispose = subscribe.currentListProperty.changes()
      .onValue(_.partial(this._onLoadList, this.scope));

    // unbind on destroy.
    this.scope.$on('$destroy', dispose);
  }

  /**
   * Private
   */

  _onLoadList(scope, list) {
    // update subscription list.
    scope.subscription.list = list;
    scope.$digest();
  }

  static factory(...args) {
    return new SubscriptionLink(...args);
  }
}

angular
  .module('app.subscribe')
  .directive('rdSubscription', Subscription.factory);

export default Subscription;
export {SubscriptionController, SubscriptionLink};
