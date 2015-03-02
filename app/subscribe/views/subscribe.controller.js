import config from '../../core/services/config.service';
import common from '../../core/services/common.service';

class SubscribeController {

  constructor($routeParams) {
    // playlist name from url or defaults.
    this.listName = $routeParams.list || config.defaults.PLAYLIST;
    // decode feed url from base64.
    this.feedUrl = atob(unescape($routeParams.token));
  }
}

SubscribeController.$inject = ['$routeParams'];

angular
  .module('app.subscribe')
  .controller('SubscribeController', SubscribeController);

export default SubscribeController;
