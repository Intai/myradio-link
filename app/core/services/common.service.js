class CommonService {

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

  /**
   * Build url path or get params.
   * @param {string} url
   * @param {object} params
   */
  buildUrl(url, params) {
    var pathParams = [];

    // replace all params in path.
    for (let param in params) {
      url = url.replace(':' + param, params[param]);
      pathParams.push(param);
    }

    // delete all params replaced in path.
    for (let key of pathParams) {
      delete params[key];
    }

    // remove all unknown params in path.
    url = url.replace(/\/:[^/]+/i, '');

    return url;
  }

  /**
   * Get the current value of a bacon property.
   * @param {object}
   */
  getBaconPropValue(property) {
    var ret = null;
    var dispose = property
      .onValue((value) => {
        ret = value;
      });

    dispose();
    return ret;
  }

  static factory() {
    return new CommonService();
  }
}

angular
  .module('app.core')
  .factory('common', CommonService.factory);

export default CommonService.factory();
