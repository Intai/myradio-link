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
      feedUrl: '@',
      feedTitle: '@'
    };
  }

  static factory() {
    return new EpisodeInfo();
  }
}

class EpisodeInfoController {

  constructor($scope, $sce) {
    // get feed data for the url specified.
    this.data = common.getBaconPropValue(
      playlist.getEpisodePropertyByUrl(this.feedUrl));

    // get feed information by url.
    this.info = common.getBaconPropValue(
      feed.getInfoPropertyByUrl(this.feedUrl));

    // when setting/updating feed data.
    $scope.$watch('episode.data', (data) => {
      if (data) {
        // trust episode content in html.
        data.contentHtml = $sce.trustAsHtml(data.content)
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
    this.dispatchActions(scope);
  }

  /**
   * Class Variables
   */

  initVars(scope, element) {
    var ctrl = scope.episode;

    /**
     * Angular directive scope.
     */
    this.scope = scope;

    /**
     * jQuery element.
     */
    this.el = $(element);

    /**
     * Stream out episode data and feed info.
     * @type {bacon.property}
     */
    this.episodeProperty = Bacon.combineTemplate({
      data: playlist.getEpisodePropertyByUrl(ctrl.feedUrl).filter(_.isObject),
      info: feed.getInfoPropertyByUrl(ctrl.feedUrl).filter(_.isObject)
    })
  }

  /**
   * Event Bindings
   */

  initEvents() {
    var ctrl = this.scope.episode,
        disposes = [];

    this.el
      // click on external anchor.
      .on('click', '.episode-info-description a', this._onClick);

    // if either feed data or info is not ready.
    if (!ctrl.data || !ctrl.info) {
      // update template when both are ready.
      var dispose = this.episodeProperty
        .onValue(_.partial(this._onLoadFeed,
          this.scope));

      disposes.push(dispose);
    }

    // unbind on destroy.
    this.scope.$on('$destroy', () => {
      this.el.off();
      common.execute(disposes);
    });
  }

  /**
   * Dispatch Actions
   */

  dispatchActions(scope) {
    var ctrl = scope.episode;

    if (!ctrl.data || !ctrl.info) {
      // dispatch to indicate loading.
      dispatcher.dispatch({
        actionType: config.actions.FEED_LOAD
      });
    }

    if (!ctrl.data) {
      // dispatch to retrieve the feed data.
      dispatcher.dispatch({
        actionType: config.actions.FEED_LOAD_DATA,
        url: ctrl.feedUrl
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

  _onLoadFeed(scope, template) {
    // dispatch the feed data and info loaded.
    dispatcher.dispatch({
      actionType: config.actions.FEED_LOAD_RESULTS,
      results: template
    });

    // update feed data and information.
    scope.episode.data = template.data;
    scope.episode.info = template.info;
    scope.$digest();
  }

  _onClick(e) {
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
