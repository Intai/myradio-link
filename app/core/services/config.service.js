class ConfigService {

  constructor() {

    /**
     * Default values.
     */
    this.defaults = {
      PLAYLIST: 'play'
    };

    /**
     * Constant numbers.
     */
    this.numbers = {
      ANIMATE_MIN_DURATION: 50,
      FEED_MAX_ENTRIES: 10,
      SPINNER_DELAY: 100
    };

    /**
     * Enumerators.
     */
    this.enums = {
      DIR_ALL: 0,
      DIR_HORIZONTAL: 1,
      DIR_VERTICAL: 2,
      MSG_UNSHIFT: 0
    };

    /**
     * Html Attributes.
     */
    this.attrs = {
      HOLDER_TYPE_DIV: 'div',
      HOLDER_TYPE_PADDING: 'padding'
    };

    /**
     * Urls.
     */
    this.urls = {
      ITUNES_SEARCH_PODCAST: 'https://itunes.apple.com/search?media=podcast&term='
    };

    /**
     * Dispatcher actions.
     */
    this.actions = {
      ROUTE_START: 'ROUTE_START',
      ROUTE_COMPLETE: 'ROUTE_COMPLETE',
      MESSAGE: 'MESSAGE',
      MESSAGE_CLOSE: 'MESSAGE_CLOSE',
      SEARCH_PODCAST: 'SEARCH_PODCAST',
      SEARCH_PODCAST_RESULTS: 'SEARCH_PODCAST_RESULTS',
      NAVIGATE: 'NAVIGATE',
      NAVIGATE_BACK: 'NAVIGATE_BACK',
      FEED_LOAD: 'FEED_LOAD',
      FEED_LOAD_RESULTS: 'FEED_LOAD_RESULTS',
      FEED_LOAD_DATA: 'FEED_LOAD_DATA',
      FEED_LOAD_INFO: 'FEED_LOAD_INFO',
      FEED_PUSH_INFO: 'FEED_PUSH_INFO',
      FEED_SUBSCRIBE: 'FEED_SUBSCRIBE',
      FEED_UNSUBSCRIBE: 'FEED_UNSUBSCRIBE',
      FEED_ADD_EPISODE: 'FEED_ADD_EPISODE',
      FEED_REMOVE_EPISODE: 'FEED_REMOVE_EPISODE',
      FEED_PLAY_EPISODE: 'FEED_PLAY_EPISODE',
      GROUP_BROADCAST: 'GROUP_BROADCAST',
      PLAYBACK_PLAY: 'PLAYBACK_PLAY',
      PLAYBACK_STOP: 'PLAYBACK_STOP',
      PLAYBACK_PAUSE: 'PLAYBACK_PAUSE',
      PLAYBACK_REWIND: 'PLAYBACK_REWIND',
      PLAYBACK_FORWARD: 'PLAYBACK_FORWARD',
      PLAYBACK_SHOW_INFO: 'PLAYBACK_SHOW_INFO',
      PLAYBACK_HIDE_INFO: 'PLAYBACK_HIDE_INFO',
      AUDIO_LOAD: 'AUDIO_LOAD',
      AUDIO_PLAY: 'AUDIO_PLAY',
      AUDIO_PAUSE: 'AUDIO_PAUSE'
    };

    /**
     * Errors.
     */
    this.errors = {
      SEARCH_ITUNES: 'Sorry, we are having trouble with iTunes search. Please try again later.'
    };
  }

  static factory() {
    return new ConfigService();
  }
}

angular
  .module('app.core')
  .factory('config', ConfigService.factory);

export default ConfigService.factory();
