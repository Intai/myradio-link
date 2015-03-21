import config from '../../core/services/config.service';
import common from '../../core/services/common.service';
import dispatcher from '../../core/services/dispatcher.service';
import playlist from '../services/playlist.service';
import module from '../../subscribe/subscribe.module';
import subscribe from '../../subscribe/services/subscribe.service';

class Playback {

  constructor() {
    this.restrict = 'E';
    this.replace = true;
    this.transclude = false;
    this.templateUrl = '/playback/directives/playback.directive.html';
    this.controller = PlaybackController;
    this.controllerAs = 'playback';
    this.bindToController = true;
    this.link = PlaybackLink.factory;
  }

  static factory() {
    return new Playback();
  }
}

class PlaybackController {}

class PlaybackLink {

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
     */
    this.el = $(element);

    /**
     * Stream out the episode being played.
     * @type {bacon.bus}
     */
    this.templateProperty = Bacon.combineTemplate({
      episode: playlist.playbackProperty,
      feeds: subscribe.currentListProperty.filter(_.isObject)
    });
    // return the episode and associated subscription feed.
    this.episodeProperty = this.templateProperty
      .map(this._mapToEpisodeFeed);
  }

  /**
   * Event Bindings
   */

  initEvents() {
    this.el
      // stop playback.
      .on('click', '.playback-stop', _.partial(this._onStop, this.scope));

    // when playing an episode.
    var dispose = this.episodeProperty
      .onValue(_.partial(this._onLoadEpisode, this.scope));

    // unbind on destroy.
    this.scope.$on('$destroy', () => {
      this.el.off();
      dispose();
    });
  }

  /**
   * Private
   */

  _onLoadEpisode(scope, template) {
    // update episode being played.
    scope.playback.episode = template.episode;
    scope.playback.feed = template.feed;
    scope.$digest();
  }

  _onStop(scope) {
    dispatcher.dispatch({
      actionType: config.actions.PLAYBACK_STOP
    });
  }

  _mapToEpisodeFeed(template) {
    if (template.episode) {
      template.feed = _.findWhere(template.feeds, {
        feedUrl: template.episode.feedUrl
      });
    }

    return template;
  }

  static factory(...args) {
    return new PlaybackLink(...args);
  }
}

angular
  .module('app.playback')
  .directive('rdPlayback', Playback.factory);

export default Playback;
export {PlaybackController, PlaybackLink};
