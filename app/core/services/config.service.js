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
        ANIMATE_MIN_DURATION: 50
    };

    /**
     * Urls.
     */
    this.urls = {
      ITUNES_SEARCH: 'https://itunes.apple.com/search?media=podcast&term='
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
