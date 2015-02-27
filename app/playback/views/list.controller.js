import config from '../../core/services/config.service';

class PlaylistController {

  constructor($routeParams) {
    // playlist name from url or defaults.
    this.listName = $routeParams.list || config.defaults.PLAYLIST;
  }
}

PlaylistController.$inject = ['$routeParams'];

angular
  .module('app.playback')
  .controller('PlaylistController', PlaylistController);

export default PlaylistController;
