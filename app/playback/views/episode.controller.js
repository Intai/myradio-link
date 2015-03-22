import config from '../../core/services/config.service';
import common from '../../core/services/common.service';

class EpisodeController {

  constructor($routeParams) {
    // playlist name from url or defaults.
    this.listName = $routeParams.list || config.defaults.PLAYLIST;
    // decode feed url from base64.
    this.feedUrl = common.decodeAsciiBase64($routeParams.tokenUrl);
    // decode feed title from base64.
    this.feedTitle = common.decodeBase64($routeParams.tokenTitle);
  }
}

EpisodeController.$inject = ['$routeParams'];

angular
  .module('app.playback')
  .controller('EpisodeController', EpisodeController);

export default EpisodeController;
