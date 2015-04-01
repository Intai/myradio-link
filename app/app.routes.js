import config from './core/services/config.service';
import common from './core/services/common.service';
import firebase from './core/services/firebase.service';
import googleApi from './core/services/google.service';
import subscribe from './subscribe/services/subscribe.service';
import playlist from './playback/services/playlist.service';
import dispatcher from './core/services/dispatcher.service';

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
        playlistName:
          routeResolveCurrentPlaylist,
        subscribe: routeResolve(() =>
          subscribe.onNonEmpty(), '/:list/subscription/add/init'),
        firebase: routeResolve(() =>
          firebase.onAuth(), '/login')
      }
    })
    .when('/:list?/subscription/add/:init', {
      templateUrl: '/subscribe/views/search.html',
      controller: 'SearchController',
      controllerAs: 'vm',
      resolve: {
        playlistName:
          routeResolveCurrentPlaylist,
        subscribe: routeResolve(() =>
          subscribe.onEmpty(), '/:list/subscription/add'),
        firebase: routeResolve(() =>
          firebase.onAuth(), '/login')
      }
    })
    .when('/:list?/subscription/add', {
      templateUrl: '/subscribe/views/search.html',
      controller: 'SearchController',
      controllerAs: 'vm',
      resolve: {
        playlistName:
          routeResolveCurrentPlaylist,
        subscribe: routeResolve(() =>
          subscribe.onNonEmpty(), '/:list/subscription/add/init'),
        firebase: routeResolve(() =>
          firebase.onAuth(), '/login')
      }
    })
    .when('/:list?/subscription/add-feed/:tokenUrl/:tokenTitle', {
      templateUrl: '/subscribe/views/subscribe.html',
      controller: 'SubscribeController',
      controllerAs: 'vm',
      resolve: {
        playlistName:
          routeResolveCurrentPlaylist,
        firebase: routeResolve(() =>
          firebase.onAuth(), '/login'),
        google: routeResolve(() =>
          googleApi.loadFeedsApi(), '/error')
      }
    })
    .when('/:list?/episode/:tokenUrl/:tokenTitle', {
      templateUrl: '/playback/views/episode.html',
      controller: 'EpisodeController',
      controllerAs: 'vm',
      resolve: {
        playlistName:
          routeResolveCurrentPlaylist,
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
        playlistName:
          routeResolveCurrentPlaylist,
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

function routeStart($rootScope) {
  $rootScope.$on('$routeChangeStart', () => {
     dispatcher.dispatch({
      actionType: config.actions.ROUTE_START
    });
  });
}

function routeSuccess($rootScope) {
  $rootScope.$on('$routeChangeSuccess', () => {
     dispatcher.dispatch({
      actionType: config.actions.ROUTE_COMPLETE
    });
  });
}

function routeError($rootScope, $location) {
  $rootScope.$on('$routeChangeError', (e, current, previous, rejection) => {
    // notify about finishing the routing.
    // e.g. hide loading spinner.
    dispatcher.dispatch({
      actionType: config.actions.ROUTE_COMPLETE
    });

    // if hasn't been redirected in routeResolve.
    if (rejection !== 'resolved.redirect') {
      // default to homepage if there is routing
      // dependency failed to be resolved.
      $location.path('/');
    }
  });
}

function routeResolve(func, redirect) {
  // eavesdrop the promise result.
  var channelResolve = function($location, $route) {
    return new Promise((resolve, reject) => {
      func().then(resolve)
      // if rejected.
      .catch(() => {
        // redirect to a fallback url.
        $location.path(common.buildUrl(redirect, $route.current.pathParams))
          // replace otherwise history back can end up looping.
          .replace();

        // dispatch to navigate back in history.
        dispatcher.dispatch({
          actionType: config.actions.NAVIGATE_BACK
        });

        // reject with a specific message to
        // skip redirection in $routeChangeError.
        reject('resolved.redirect');
      });
    });
  };

  channelResolve.$inject = ['$location', '$route'];

  return channelResolve;
}

function routeResolveCurrentPlaylist($route) {
  // setup the current playlist according to route.
  playlist.routeResolveCurrent($route);
  subscribe.routeResolveCurrent($route);
}

routes.$inject = ['$routeProvider', '$locationProvider'];
routeStart.$inject = ['$rootScope'];
routeSuccess.$inject = ['$rootScope'];
routeError.$inject = ['$rootScope', '$location'];
routeResolveCurrentPlaylist.$inject = ['$route'];

angular
  .module('app')
  .config(routes)
  .run(routeStart)
  .run(routeSuccess)
  .run(routeError);
