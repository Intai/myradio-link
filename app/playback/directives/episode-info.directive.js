import dispatcher from '../../core/services/dispatcher.service';
import config from '../../core/services/config.service';
import common from '../../core/services/common.service';
import playlist from '../services/playlist.service';
import module from '../../subscribe/subscribe.module';
import feed from '../../subscribe/services/feed.service';

class EpisodeInfo {

  constructor() {
    this.restrict = 'E';
    this.replace = true;
    this.transclude = false;
    this.templateUrl = '/playback/directives/episode-info.directive.html';
    this.controller = EpisodeInfoController;
    this.controllerAs = 'episode';
    this.bindToController = true;
    this.link = EpisodeInfoLink.factory;
    this.scope = {
      linkUrl: '@',
      feedTitle: '@'
    };
  }

  static factory() {
    return new EpisodeInfo();
  }
}

class EpisodeInfoController {

  constructor($scope, $sce) {
    // get episode data for the url specified.
    this.data = common.getBaconPropValue(
      playlist.getEpisodePropertyByUrl(this.linkUrl));

    if (this.data) {
      // get feed information by url.
      this.info = common.getBaconPropValue(
        feed.getInfoPropertyByUrl(this.data.feedUrl));
    }

    // when setting/updating episode data.
    $scope.$watch('episode.data', (data) => {
      if (data) {
        // trust episode content in html.
        this.contentHtml = $sce.trustAsHtml(data.content);
      }
    });
  }
}

class EpisodeInfoLink {

  constructor(scope, element, attrs) {
    // setup class variables.
    this.initVars(scope, element);
    // setup event bindings.
    this.initEvents();
    // dispatch actions on init.
    this.dispatchActions();
  }

  /**
   * Class Variables
   */

  initVars(scope, element) {
    /**
     * Angular directive scope.
     */
    this.scope = scope;

    /**
     * jQuery element.
     */
    this.el = $(element);
  }

  /**
   * Event Bindings
   */

  initEvents() {
    var ctrl = this.scope.episode,
        dispose = () => {};

    this.el
      // click on external anchor.
      .on('click', '.episode-info-description a', this._onClick);

    // if either feed data or info is not ready.
    if (!ctrl.data || !ctrl.info) {
      // load episode data then feed info.
      dispose = playlist.getEpisodePropertyByUrl(ctrl.linkUrl)
        .filter(_.isObject)
        .flatMap(_.partial(this._onLoadData, this.scope))
        .onValue(_.partial(this._onLoadFeed, this.scope));
    }

    // unbind on destroy.
    this.scope.$on('$destroy', () => {
      this._dispatchHideInfo(this.scope);
      this.el.off();
      dispose();
    });
  }

  /**
   * Dispatch Actions
   */

  dispatchActions() {
    var ctrl = this.scope.episode;

    // dispatch to indicate showing info.
    dispatcher.dispatch({
      actionType: config.actions.PLAYBACK_SHOW_INFO,
      episode: ctrl.data
    });

    if (!ctrl.data || !ctrl.info) {
      // dispatch to indicate loading.
      dispatcher.dispatch({
        actionType: config.actions.FEED_LOAD
      });
    }

    if (!ctrl.info) {
      // dispatch to retrieve feed info.
      dispatcher.dispatch({
        actionType: config.actions.FEED_LOAD_INFO,
        title: ctrl.feedTitle
      });
    }
  }

  /**
   * Private
   */

  _onLoadData(scope, data) {
    // update episode data.
    scope.episode.data = data;
    // return a property of feed info by url.
    return feed.getInfoPropertyByUrl(data.feedUrl)
      .filter(_.isObject);
  }

  _onLoadFeed(scope, info) {
    // dispatch the feed data and info loaded.
    dispatcher.dispatch({
      actionType: config.actions.FEED_LOAD_RESULTS,
      results: {
        data: scope.episode.data,
        info: info
      }
    });

    // update feed information.
    scope.episode.info = info;
    scope.$digest();
  }

  _dispatchHideInfo(scope) {
    // dispatch on disposing the directive.
    dispatcher.dispatch({
      actionType: config.actions.PLAYBACK_HIDE_INFO,
      episode: scope.episode.data
    });
  }

  _onClick(e) {
    // open external link in new tab.
    window.open(e.target.href, '_blank');
    e.preventDefault();
  }

  static factory(...args) {
    return new EpisodeInfoLink(...args);
  }
}

EpisodeInfoController.$inject = ['$scope', '$sce'];

angular
  .module('app.playback')
  .directive('rdEpisodeInfo', EpisodeInfo.factory);

export default EpisodeInfo;
export {EpisodeInfoController, EpisodeInfoLink};
