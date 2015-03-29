import config from '../../core/services/config.service';
import common from '../../core/services/common.service';
import dispatcher from '../../core/services/dispatcher.service';
import playStore from '../services/playback.service';

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
    this.scope = {};
  }

  static factory() {
    return new Playback();
  }
}

class PlaybackController {

  constructor($scope) {
    // paused by default.
    this.paused = common.getBaconPropValue(playStore.pauseProperty);
    // default to show info button.
    this.showInfo = !common.getBaconPropValue(playStore.infoProperty);

    // when setting/updating episode being played.
    $scope.$watchGroup(['playback.episode', 'playback.feed'],
      _.bind(this._encodeBase64, this));
  }

  _encodeBase64(values) {
    var [episode, feed] = values;

    // need episode data and feed info.
    if (episode && feed) {
      // encode episode link and feed title to base64 for url.
      this.episodeLinkBase64 = common.encodeAsciiBase64(episode.link);
      this.episodeTitleBase64 = common.encodeBase64(feed.trackName);
    }
  }
}

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
  }

  /**
   * Event Bindings
   */

  initEvents() {
    var disposes = [];

    this.el
      // pause or resume playback.
      .on('click vclick', '.playback-pause-play',
        _.bind(_.partial(this._onPausePlay, this.scope), this))
      // stop playback.
      .on('click vclick', '.playback-stop', this._onStop);

    // when playing an episode.
    disposes.push(playStore.episodeProperty
      .onValue(_.partial(this._onLoadEpisode, this.scope)));

    // when showing/hiding episode info.
    disposes.push(playStore.infoStream
      .onValue(_.partial(this._onShowInfo, this.scope)));

    // when pause/resume playback.
    disposes.push(playStore.pauseStream
      .onValue(_.partial(this._onPause, this.scope)));

    // unbind on destroy.
    this.scope.$on('$destroy', () => {
      this.el.off();
      common.execute(disposes);
    });
  }

  /**
   * Private
   */

  _onLoadEpisode(scope, template) {
    if (!template.feed && template.episode) {
      // dispatch to retrieve feed info.
      dispatcher.dispatch({
        actionType: config.actions.FEED_LOAD_INFO,
        title: template.episode.feedTitle
      });
    }

    scope.$evalAsync(() => {
      // update episode being played.
      scope.playback.listName = template.current;
      scope.playback.episode = template.episode;
      scope.playback.feed = template.feed;
    });
  }

  _onShowInfo(scope, showInfo) {
    scope.playback.showInfo = !showInfo;
    scope.$digest();
  }

  _onPausePlay(scope) {
    var actionType = (scope.playback.paused)
      ? config.actions.PLAYBACK_PLAY
      : config.actions.PLAYBACK_PAUSE;

    // toggle play/pause.
    dispatcher.dispatch({
      actionType: actionType
    });
  }

  _onPause(scope, paused) {
    scope.playback.paused = paused;
    scope.$digest();
  }

  _onStop() {
    dispatcher.dispatch({
      actionType: config.actions.PLAYBACK_STOP
    });
  }

  static factory(...args) {
    return new PlaybackLink(...args);
  }
}

PlaybackController.$inject = ['$scope'];

angular
  .module('app.playback')
  .directive('rdPlayback', Playback.factory);

export default Playback;
export {PlaybackController, PlaybackLink};
