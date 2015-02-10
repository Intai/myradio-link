
var config = (...deps) => {
    deps[0]
        .otherwise({redirectTo: '/login'});
};

config.$inject = ['$routeProvider'];

angular
  .module('app')
  .config(config);
