import dispatcher from '../../core/services/dispatcher.service';
import config from '../../core/services/config.service';
import common from '../../core/services/common.service';
import browser from '../../core/services/browser.service';

class SubscriptionItem {

  constructor() {
    this.restrict = 'E';
    this.replace = true;
    this.transclude = false;
    this.templateUrl = '/subscribe/directives/subscription-item.directive.html';
    this.controller = SubscriptionItemController;
    this.controllerAs = 'item';
    this.bindToController = true;
    this.require = 'rdAnimate';
    this.link = SubscriptionItemLink.factory;
    this.scope = {
      feed: '='
    };
  }

  static factory() {
    return new SubscriptionItem();
  }
}

class SubscriptionItemController {

  constructor() {
    // encode feed url to base64.
    this.feed.feedUrlBase64 = common.encodeAsciiBase64(this.feed.feedUrl);
    // encode feed title to base64.
    this.feed.feedTitleBase64 = common.encodeBase64(this.feed.trackName);
    // stream out reveal/hide signal.
    this.revealStream = new Bacon.Bus();
  }
}

class SubscriptionItemLink {

  constructor(scope, element, attrs, animate) {
    // setup class variables.
    this.initVars(scope, element, animate);
    // setup event bindings.
    this.initEvents();
  }

  /**
   * Class Variables
   */

  initVars(scope, element, animate) {
    /**
     * Angular directive scope.
     */
    this.scope = scope;

    /**
     * jQuery element.
     * @type {object}
     */
    this.el = $(element);

    /**
     * Animate directive controller.
     * @type {object}
     */
    this.animate = animate;
  }

  /**
   * Event Bindings
   */

  initEvents() {
    this.el
      // down state.
      .on('mousedown touchstart', '.subscription-item-anchor',
        _.partial(this._onDown, this.animate))
      // up state.
      .on('mouseup dragend touchend', '.subscription-item-anchor',
        _.partial(this._onUp, this.animate))
      // select the podcast feed.
      .on('click vclick', '.subscription-item-anchor',
        _.partial(this._onClick, this.scope))
      // unsubscribe.
      .on('click', '.subscription-delete',
        _.partial(this._onDelete, this.scope));

    // todo
    // how about surface?
    if (!browser.supportTouch()) {
      this.el
        // reveal on mouse enter.
        .on('mouseenter', _.partial(this._onEnter, this.scope))
        // hide on mouse leave.
        .on('mouseleave', _.partial(this._onLeave, this.scope));
    }

    // unbind on destroy.
    this.scope.$on('$destroy', () => this.el.off());
  }

  /**
   * Private
   */

  _onDown(animate) {
    animate
      .reset(0)
      .setReverse(false)
      .restart();
  }

  _onUp(animate) {
    animate
      .setReverse(true)
      .start();
  }

  _onClick(scope) {
    // dispatch to push the selected feed.
    dispatcher.dispatch({
      actionType: config.actions.FEED_PUSH_INFO,
      info: scope.item.feed
    });
  }

  _onDelete(scope) {
    // dispatch to unsubscribe the feed.
    dispatcher.dispatch({
      actionType: config.actions.FEED_UNSUBSCRIBE,
      feedInfo: scope.item.feed
    });
  }

  _onEnter(scope) {
    scope.item.revealStream.push(true);
  }

  _onLeave(scope) {
    scope.item.revealStream.push(false);
  }

  static factory(...args) {
    return new SubscriptionItemLink(...args);
  }
}

angular
  .module('app.subscribe')
  .directive('rdSubscriptionItem', SubscriptionItem.factory);

export default SubscriptionItem;
export {SubscriptionItemController, SubscriptionItemLink};
