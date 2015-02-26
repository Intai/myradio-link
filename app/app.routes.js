var routes = ($routeProvider) => {
  $routeProvider
    .when('/login', {
        templateUrl: '/authenticate/views/login.html'
    })
    .when('/:list', {
        templateUrl: '/playback/views/list.html'
    })
    .otherwise({
        redirectTo: '/login'
    });
};

routes.$inject = ['$routeProvider'];

angular
  .module('app')
  .config(routes);
