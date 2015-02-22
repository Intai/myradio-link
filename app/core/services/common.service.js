class CommonService {

  constructor() {

  }

  /**
   * Wrap a function to be chainable.
   * @param {function} func
   */
  chainable(func) {
    return function() {
      func.apply(this, arguments);
      return this;
    };
  }

  static factory() {
    return new CommonService();
  }
}

angular
  .module('app.core')
  .factory('common', CommonService.factory);

export default new CommonService();
