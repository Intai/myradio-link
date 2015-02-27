import firebase from './core/services/firebase.service';

var routes = ($routeProvider, $locationProvider) => {

  $routeProvider
    .when('/login', {
        templateUrl: '/authenticate/views/login.html'
    })
    .when('/:list?/subscription', {
      templateUrl: '/subscribe/views/list.html',
      controller: 'SubscriptionController',
      controllerAs: 'vm',
      resolve: {
        firebase: () => firebase.onAuth()
      }
    })
    .when('/:list?', {
      templateUrl: '/playback/views/list.html',
      controller: 'PlaylistController',
      controllerAs: 'vm',
      resolve: {
        firebase: () => firebase.onAuth()
      }
    })
    .otherwise({
      redirectTo: '/login'
    });

  // enable pushState.
  $locationProvider.html5Mode({
    enabled: true,
    requireBase: false
  });
};

var routeError = ($rootScope, $location) => {
  $rootScope.$on('$routeChangeError', () => {
    // default to login if there is routing
    // dependency failed to be resolved.
    $location.path('/login');
  });
};

routes.$inject = ['$routeProvider', '$locationProvider'];
routeError.$inject = ['$rootScope', '$location'];

angular
  .module('app')
  .config(routes)
  .run(routeError);
