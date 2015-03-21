import dispatcher from '../../core/services/dispatcher.service';
import config from '../../core/services/config.service';
import common from '../../core/services/common.service';
import playlist from '../services/playlist.service';

class Playlist {

  constructor() {
    this.restrict = 'E';
    this.replace = true;
    this.transclude = false;
    this.templateUrl = '/playback/directives/playlist.directive.html';
    this.controller = PlaylistController;
    this.controllerAs = 'playlist';
    this.bindToController = true;
    this.link = PlaylistLink.factory;
    this.scope = {};
  }

  static factory() {
    return new Playlist();
  }
}

class PlaylistController {

  constructor() {
    // current playlist according to routing.
    this.list = common.getBaconPropValue(playlist.currentListProperty);
  }
}

class PlaylistLink {

  constructor(scope, element, attrs) {
    // setup class variables.
    this.initVars(scope, element);
    // setup event bindings.
    this.initEvents();
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
     * @type {object}
     */
    this.el = element;
  }

  /**
   * Event Bindings
   */

  initEvents() {
    // when the current playlist is loaded.
    var dispose = playlist.currentListProperty.changes()
      .onValue(_.partial(this._onLoadList, this.scope));

    // unbind on destroy.
    this.scope.$on('$destroy', dispose);
  }

  /**
   * Private
   */

  _onLoadList(scope, list) {
    // update playlist.
    scope.playlist.list = list;
    scope.$digest();
  }

  static factory(...args) {
    return new PlaylistLink(...args);
  }
}

angular
  .module('app.playback')
  .directive('rdPlaylist', Playlist.factory);

export default Playlist;
export {PlaylistController, PlaylistLink};
