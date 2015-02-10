var config = (...deps) => {
    deps.$routeProvider
        .otherwise({redirectTo: '/login'});
};

config.$inject = ['$routeProvider'];

angular
  .module('app')
  .config(config);