var routes = ($routeProvider) => {
    $routeProvider
        .otherwise({redirectTo: '/login'});
};

routes.$inject = ['$routeProvider'];

angular
  .module('app')
  .config(routes);
