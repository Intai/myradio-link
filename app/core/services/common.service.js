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
   * Execute a collection of functions.
   * @param {array}
   */
  execute(funcs) {
    _.each(funcs, (func) => func());
  }

  /**
   * Call either functions on a condition.
   * @param {bool} cond
   * @param {function} if
   * @param {function} else
   */
  callIfElse(cond, funcIf, funcElse) {
    if (cond) {
      funcIf();
    } else {
      funcElse();
    }
  }

  /**
   * Flip underscore findWhere for chaining. e.g. bacon map.
   * @param {object}
   */
  findWhere(properties) {
    return function(list) {
      return _.findWhere(list, properties);
    };
  }

  /**
   * Flip function arguments.
   * @param {function}
   */
  flip(func) {
    return function(...args) {
      func(...args.reverse());
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
   * @param {object} property
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

  /**
   * Accumulate data in an array.
   * @param {array} array
   * @param {object} data
   */
  accumulateInArray(array, data) {
    if (!_.isArray(array)) {
      array = [];
    }

    // accumulate feed data into an array.
    if (_.isArray(data)) {
      array.splice(0, array.length, ...data);
    } else {
      array.push(data);
    }

    return array;
  }

  /**
   * Accumulate data in an object.
   * @param {obejct} object
   * @param {object} data
   */
  accumulateInObject(object, data) {
    if (!_.isObject(object)) {
      object = {};
    }

    // accumulate feed data into an object.
    for (let key in data) {
      if (key in object) {
        _.extend(object[key], data[key]);
      } else {
        object[key] = data[key];
      }
    }

    return object;
  }

  /**
   * Map a bacon property to select an obejct out of array.
   * @param {object} property
   * @param {string} attr
   * @pram {string} value
   */
  mapBaconPropArrayWhere(property, attr, value) {
    return property.map((array) =>
      _.findWhere(array, {[attr]: value}));
  }

  static factory() {
    return new CommonService();
  }
}

angular
  .module('app.core')
  .factory('common', CommonService.factory);

export default CommonService.factory();
