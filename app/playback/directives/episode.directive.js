import config from '../../core/services/config.service';
import common from '../../core/services/common.service';
import browser from '../../core/services/browser.service';
import dispatcher from '../../core/services/dispatcher.service';
import module from '../../subscribe/subscribe.module';
import feed from '../../subscribe/services/feed.service';

class Episode {

  constructor() {
    this.restrict = 'E';
    this.replace = true;
    this.transclude = false;
    this.templateUrl = '/playback/directives/episode.directive.html';
    this.controller = EpisodeController;
    this.controllerAs = 'item';
    this.bindToController = true;
    this.require = 'rdAnimate';
    this.link = EpisodeLink.factory;
    this.scope = {
      episode: '='
    };
  }

  static factory() {
    return new Episode();
  }
}

class EpisodeController {

  constructor($scope) {
    // stream out reveal/hide signal.
    this.revealStream = new Bacon.Bus();

    // find the assocaited subscription feed.
    this.feedProperty = feed.getInfoPropertyByUrl(this.episode.feedUrl);
    this.feed = common.getBaconPropValue(this.feedProperty);

    // create date object from the published date string.
    $scope.$watch('item.episode', (episode) =>
      episode.publishedDateObject = new Date(episode.publishedDate));
  }
}

class EpisodeLink {

  constructor(scope, element, attrs, animate) {
    // setup class variables.
    this.initVars(scope, element, animate);
    // setup event bindings.
    this.initEvents();
    // dispatch actions on init.
    this.dispatchActions();
  }

  /**
   * Class Variables
   */

  initVars(scope, element, animate) {
    /**
     * Angular directive scope.
     * @type {object}
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
      .on('mousedown touchstart', '.episode-play',
        _.partial(this._onDown, this.animate))
      // up state.
      .on('mouseup dragend touchend', '.episode-play',
        _.partial(this._onUp, this.animate))
      // play the podcast episode.
      .on('click', '.episode-play',
        _.partial(this._onClick, this.scope))
      // remove the episode.
      .on('click', '.episode-delete',
        _.partial(this._onDelete, this.scope));

    if (!browser.supportTouch()) {
      this.el
        // reveal on mouse enter.
        .on('mouseenter', _.partial(this._onEnter, this.scope))
        // hide on mouse leave.
        .on('mouseleave', _.partial(this._onLeave, this.scope));
    }

    // when subscription feed is updated.
    var dispose = this.scope.item.feedProperty.changes()
      .onValue(_.partial(this._onFeedUpdate, this.scope));

    // unbind on destroy.
    this.scope.$on('$destroy', () => {
      this.el.off();
      dispose();
    });
  }

  /**
  * Dispatch Actions
  */

  dispatchActions() {
    if (!this.scope.item.feed) {
      // dispatch to retrieve feed info.
      dispatcher.dispatch({
        actionType: config.actions.FEED_LOAD_INFO,
        title: this.scope.item.episode.feedTitle
      });
    }
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

  _onFeedUpdate(scope, feed) {
    scope.item.feed = feed;
    scope.$digest();
  }

  _onClick(scope) {
    // dispatch to play the episode.
    dispatcher.dispatch({
      actionType: config.actions.FEED_PLAY_EPISODE,
      episode: scope.item.episode
    });
  }

  _onDelete(scope) {
    // dispatch to remove from the current playlist.
    dispatcher.dispatch({
      actionType: config.actions.FEED_REMOVE_EPISODE,
      episode: scope.item.episode
    });
  }

  _onEnter(scope) {
    scope.item.revealStream.push(true);
  }

  _onLeave(scope) {
    scope.item.revealStream.push(false);
  }

  static factory(...args) {
    return new EpisodeLink(...args);
  }
}

EpisodeController.$inject = ['$scope'];

angular
  .module('app.playback')
  .directive('rdEpisode', Episode.factory);

export default Episode;
export {EpisodeController, EpisodeLink};
