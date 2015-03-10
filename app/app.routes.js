import common from './core/services/common.service';
import firebase from './core/services/firebase.service';
import googleApi from './core/services/google.service';
import subscribe from './subscribe/services/subscribe.service';
import playlist from './playback/services/playlist.service';

var routeResolve = (func, redirect) => {
  // eavesdrop the promise result.
  var channelResolve = function($location, $route) {
    return new Promise((resolve, reject) => {
      func().then(resolve)
        // if rejected.
        .catch(() => {
          // redirect to a fallback url.
          $location.path(common.buildUrl(redirect, $route.current.pathParams));
          // reject with a specific message to
          // skip redirection in $routeChangeError.
          reject('resolved.redirect');
        });
    });
  };

  channelResolve.$inject = ['$location', '$route'];

  return channelResolve;
};

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
        playlistName: ['$route',_.bind(
          playlist.routeResolveCurrent, playlist)],
        subscribeName: ['$route',_.bind(
          subscribe.routeResolveCurrent, subscribe)],
        subscribe: routeResolve(() =>
          subscribe.onNonEmpty(), '/:list/subscription/add/init'),
        firebase: routeResolve(() =>
          firebase.onAuth(), '/login')
      }
    })
    .when('/:list?/subscription/add/:init?', {
      templateUrl: '/subscribe/views/search.html',
      controller: 'SearchController',
      controllerAs: 'vm',
      resolve: {
        playlistName: ['$route',_.bind(
          playlist.routeResolveCurrent, playlist)],
        subscribeName: ['$route',_.bind(
          subscribe.routeResolveCurrent, subscribe)],
        firebase: routeResolve(() =>
          firebase.onAuth(), '/login')
      }
    })
    .when('/:list?/subscription/add-feed/:tokenUrl/:tokenTitle', {
      templateUrl: '/subscribe/views/subscribe.html',
      controller: 'SubscribeController',
      controllerAs: 'vm',
      resolve: {
        playlistName: ['$route',_.bind(
          playlist.routeResolveCurrent, playlist)],
        subscribeName: ['$route',_.bind(
          subscribe.routeResolveCurrent, subscribe)],
        firebase: routeResolve(() =>
          firebase.onAuth(), '/login'),
        google: routeResolve(() =>
          googleApi.loadFeedsApi(), '/error')
      }
    })
    .when('/:list?', {
      templateUrl: '/playback/views/list.html',
      controller: 'PlaylistController',
      controllerAs: 'vm',
      resolve: {
        playlistName: ['$route',_.bind(
          playlist.routeResolveCurrent, playlist)],
        subscribeName: ['$route',_.bind(
          subscribe.routeResolveCurrent, subscribe)],
        playlist: routeResolve(() =>
          playlist.onNonEmpty(), '/:list/subscription'),
        firebase: routeResolve(() =>
          firebase.onAuth(), '/login')
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
  $rootScope.$on('$routeChangeError', (e, current, previous, rejection) => {
    // if hasn't been redirected in routeResolve.
    if (rejection !== 'resolved.redirect') {
      // default to homepage if there is routing
      // dependency failed to be resolved.
      $location.path('/');
    }
  });
};

routes.$inject = ['$routeProvider', '$locationProvider'];
routeError.$inject = ['$rootScope', '$location'];

angular
  .module('app')
  .config(routes)
  .run(routeError);
