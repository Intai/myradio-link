import common from '../../core/services/common.service';
import browser from '../../core/services/browser.service';
import module from '../../subscribe/subscribe.module';
import subscribe from '../../subscribe/services/subscribe.service';

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

  constructor() {
    // create date object from the published date string.
    this.episode.publishedDateObject = new Date(this.episode.publishedDate);
    // stream out reveal/hide signal.
    this.revealStream = new Bacon.Bus();

    // find the assocaited subscription feed.
    this.feedProperty = subscribe.currentListProperty
      .map(common.findWhere({feedUrl: this.episode.feedUrl}));
    this.feed = common.getBaconPropValue(this.feedProperty);
  }
}

class EpisodeLink {

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
      .on('mousedown touchstart', '.episode-anchor',
        _.partial(this._onDown, this.animate))
      // up state.
      .on('mouseup dragend touchend', '.episode-anchor',
        _.partial(this._onUp, this.animate));

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

angular
  .module('app.playback')
  .directive('rdEpisode', Episode.factory);

export default Episode;
export {EpisodeController, EpisodeLink};
