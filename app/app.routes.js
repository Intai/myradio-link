var routes = ($routeProvider, $locationProvider) => {
  $routeProvider
    .when('/login', {
        templateUrl: '/authenticate/views/login.html'
    })
    .otherwise({
        templateUrl: '/playback/views/list.html',
        resolve: {}
    });

  // enable pushState.
  $locationProvider.html5Mode({
    enabled: true,
    requireBase: false
  });
};

routes.$inject = ['$routeProvider', '$locationProvider'];

angular
  .module('app')
  .config(routes);
