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
      FEED_MAX_ENTRIES: 10
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
      MESSAGE: 'MESSAGE',
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
      FEED_REMOVE_EPISODE: 'FEED_REMOVE_EPISODE'
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
