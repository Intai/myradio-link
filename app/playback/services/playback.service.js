import dispatcher from '../../core/services/dispatcher.service';
import common from '../../core/services/common.service';
import config from '../../core/services/config.service';
import playlist from './playlist.service';
import module from '../../subscribe/subscribe.module';
import subscribe from '../../subscribe/services/subscribe.service';

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
      feeds: subscribe.currentListProperty.filter(_.isObject)
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
  }

  /**
   * Action Handlers
   */

  initActionHandlers() {
    // action from dispatcher to add an espisode.
    dispatcher.register(config.actions.PLAYBACK_SHOW_INFO,
      _.partial(this._showInfoActionHandler,
        this.infoStream));

    // action to remove an espisode.
    dispatcher.register(config.actions.PLAYBACK_HIDE_INFO,
      _.partial(this._hideInfoActionHandler,
        this.infoStream));
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

  static factory() {
    return new PlaybackService();
  }
}

angular
  .module('app.playback')
  .factory('playback', PlaybackService.factory);

export default PlaybackService.factory();
