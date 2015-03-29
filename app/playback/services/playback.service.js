import dispatcher from '../../core/services/dispatcher.service';
import common from '../../core/services/common.service';
import config from '../../core/services/config.service';
import playlist from './playlist.service';
import module from '../../subscribe/subscribe.module';
import feed from '../../subscribe/services/feed.service';

class PlaybackService {

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
     * Stream out the episode being played.
     * @type {bacon.property}
     */
    this.templateProperty = Bacon.combineTemplate({
      episode: playlist.playbackProperty,
      current: playlist.currentProperty.filter(_.isString),
      feeds: feed.infoProperty.filter(_.isArray)
    });
    // return the episode and associated subscription feed.
    this.episodeProperty = this.templateProperty
      .map(this._mapToEpisodeFeed);

    /**
     * Stream out whether showing episode info.
     * @type {bacon.bus}
     */
    this.infoStream = new Bacon.Bus();
    this.infoProperty = this.infoStream.toProperty(false);
    this.infoProperty.onValue();

    /**
     * Stream out whether playback is currently paused.
     */
    this.pauseStream = new Bacon.Bus();
    this.pauseProperty = this.pauseStream.toProperty(true);
    this.pauseProperty.onValue();
  }

  /**
   * Action Handlers
   */

  initActionHandlers() {
    // action from dispatcher to add an espisode.
    dispatcher.register(config.actions.PLAYBACK_SHOW_INFO,
      _.partial(this._showInfoActionHandler,
        this.infoStream));

    // action to remove an episode.
    dispatcher.register(config.actions.PLAYBACK_HIDE_INFO,
      _.partial(this._hideInfoActionHandler,
        this.infoStream));

    // action to play the current episode.
    dispatcher.register(config.actions.PLAYBACK_PLAY,
      _.partial(this._playActionHandler,
        this.pauseStream));

    // action to pause the current episode.
    dispatcher.register(config.actions.PLAYBACK_PAUSE,
      _.partial(this._pauseActionHandler,
        this.pauseStream));

    // action to choose an episode.
    dispatcher.register(config.actions.FEED_PLAY_EPISODE,
      _.partial(this._playEpisodeActionHandler,
        this.pauseStream));
  }

  /**
   * Private
   */

  _mapToEpisodeFeed(template) {
    if (template.episode) {
      template.feed = _.findWhere(template.feeds, {
        feedUrl: template.episode.feedUrl
      });
    }

    return template;
  }

  _showInfoActionHandler(infoStream) {
    infoStream.push(true);
  }

  _hideInfoActionHandler(infoStream) {
    infoStream.push(false);
  }

  _playActionHandler(pauseStream) {
    pauseStream.push(false);
  }

  _pauseActionHandler(pauseStream) {
    pauseStream.push(true);
  }

  _playEpisodeActionHandler(pauseStream) {
    pauseStream.push(false);
  }

  static factory() {
    return new PlaybackService();
  }
}

angular
  .module('app.playback')
  .factory('playback', PlaybackService.factory);

export default PlaybackService.factory();
