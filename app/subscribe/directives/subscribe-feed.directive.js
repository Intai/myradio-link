import dispatcher from '../../core/services/dispatcher.service';
import config from '../../core/services/config.service';
import common from '../../core/services/common.service';
import feed from '../services/feed.service';

class SubscribeFeed {

  constructor() {
    this.restrict = 'E';
    this.replace = true;
    this.transclude = false;
    this.templateUrl = '/subscribe/directives/subscribe-feed.directive.html';
    this.controller = SubscribeFeedController;
    this.controllerAs = 'feed';
    this.bindToController = true;
    this.link = SubscribeFeedLink.factory;
    this.scope = {
      feedUrl: '@'
    };
  }

  static factory() {
    return new SubscribeFeed();
  }
}

class SubscribeFeedController {

  constructor() {
    // get the feed data for the url specified.
    this.data = common.getBaconPropValue(
      feed.getDataPropertyByUrl(this.feedUrl));
  }
}

class SubscribeFeedLink {

  constructor(scope, element, attrs) {
    // setup class variables.
    this.initVars(scope, element);
    // setup event bindings.
    this.initEvents();
    // dispatch actions on init.
    this.dispatchActions(scope);
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
    this.el.find('.subscribe')
      // on confirmation of the feed subscription.
      .on('click.feed', _.partial(this._onSubscribe,
        this.scope));

    // after restrieving feed data.
    var dispose = feed.dataStream
      .onValue(_.partial(this._onFeedData,
        this.scope));

    // unbind on destroy.
    this.scope.$on('$destroy', () => {
      this.el.off('click.feed');
      dispose();
    });
  }

  /**
   * Dispatch Actions
   */

  dispatchActions(scope) {
    if (!scope.feed.data) {
      // dispatch to retrieve the feed data.
      dispatcher.dispatch({
        actionType: config.actions.FEED_DATA,
        url: scope.feed.feedUrl
      });
    }
  }

  /**
   * Private
   */

  _onSubscribe(scope, e) {
    // dispatch to retrieve the feed data.
    dispatcher.dispatch({
      actionType: config.actions.FEED_SUBSCRIBE,
      url: scope.feed.feedUrl,
      data: scope.feed.data
    });
  }

  _onFeedData(scope, data) {
    scope.$apply(() => {
      // update feed data.
      scope.feed.data = data;
    });
  }

  static factory(...args) {
    return new SubscribeFeedLink(...args);
  }
}

angular
  .module('app.subscribe')
  .directive('rdSubscribeFeed', SubscribeFeed.factory);

export default SubscribeFeed;
export {SubscribeFeedController, SubscribeFeedLink};
