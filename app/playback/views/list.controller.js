class PlaylistController {

  constructor($routeParams, defaults) {
    // playlist name from url or defaults.
    this.listName = $routeParams.list || defaults.PLAYLIST;
  }
}

PlaylistController.$inject = ['$routeParams', 'defaults'];

angular
  .module('app.playback')
  .controller('PlaylistController', PlaylistController);

export default PlaylistController;
