import dispatcher from '../../core/services/dispatcher.service';
import config from '../../core/services/config.service';
import common from '../../core/services/common.service';
import subscribe from '../services/subscribe.service';
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
      feedUrl: '@',
      feedTitle: '@'
    };
  }

  static factory() {
    return new SubscribeFeed();
  }
}

class SubscribeFeedController {

  constructor() {
    // get feed data for the url specified.
    this.data = common.getBaconPropValue(
      feed.getDataPropertyByUrl(this.feedUrl));

    // get feed information by url.
    this.info = common.getBaconPropValue(
      feed.getInfoPropertyByUrl(this.feedUrl));

    // whether the episode is in the current playlist.
    this.subscribedProperty = subscribe.currentListProperty
      .map(common.findWhere({feedUrl: this.feedUrl}));
    // show plus or minus icon.
    this.subscribed = common.getBaconPropValue(this.subscribedProperty);
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
    this.el = $(element);
  }

  /**
   * Event Bindings
   */

  initEvents() {
    var ctrl = this.scope.feed,
        disposes = [];

    this.el
      // on confirmation of the feed subscription.
      .on('click.feed', '.feed-subscribe', _.partial(this._onSubscribe,
        this.scope));

    // whether the episode has been added or removed from playlist.
    disposes.push(this.scope.feed.subscribedProperty.changes()
      .onValue(_.partial(this._onSubscribed, this.scope)));

    // if either feed data or info is not ready.
    if (!ctrl.data || !ctrl.info) {
      var dispose = Bacon.combineTemplate({
        data: feed.getDataPropertyByUrl(ctrl.feedUrl).filter(_.isObject),
        info: feed.getInfoPropertyByUrl(ctrl.feedUrl).filter(_.isObject)
      })
      // update template when both are ready.
      .onValue(_.partial(this._onLoadFeed,
        this.scope));

      disposes.push(dispose);
    }

    // unbind on destroy.
    this.scope.$on('$destroy', () => {
      this.el.off('click.feed');
      common.execute(disposes);
    });
  }

  /**
   * Dispatch Actions
   */

  dispatchActions(scope) {
    var ctrl = scope.feed;

    if (!ctrl.data || !ctrl.info) {
      // dispatch to indicate loading.
      dispatcher.dispatch({
        actionType: config.actions.FEED_LOAD
      });
    }

    if (!ctrl.data) {
      // dispatch to retrieve the feed data.
      dispatcher.dispatch({
        actionType: config.actions.FEED_LOAD_DATA,
        url: ctrl.feedUrl
      });
    }

    if (!ctrl.info) {
      // dispatch to retrieve feed info.
      dispatcher.dispatch({
        actionType: config.actions.FEED_LOAD_INFO,
        title: ctrl.feedTitle
      });
    }
  }

  /**
   * Private
   */

  _onSubscribe(scope) {
    var actionType = (scope.feed.subscribed)
      ? config.actions.FEED_UNSUBSCRIBE
      : config.actions.FEED_SUBSCRIBE;

    // dispatch to subscribe to the feed.
    dispatcher.dispatch({
      actionType: actionType,
      feedInfo: scope.feed.info
    });
  }

  _onLoadFeed(scope, template) {
    // dispatch the feed data and info loaded.
    dispatcher.dispatch({
      actionType: config.actions.FEED_LOAD_RESULTS,
      results: template
    });

    // update feed data and information.
    scope.feed.data = template.data;
    scope.feed.info = template.info;
    scope.$digest();
  }

  _onSubscribed(scope, subscribed) {
    scope.feed.subscribed = !!subscribed;
    scope.$digest();
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
