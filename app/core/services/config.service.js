class ConfigService {

  constructor() {
    this.CORE_ANIMATE_MIN_DURATION = 50;
  }

  static factory() {
    return new ConfigService();
  }
}

angular
  .module('app.core')
  .factory('config', ConfigService.factory);

export default new ConfigService();
