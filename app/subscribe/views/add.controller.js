import config from '../../core/services/config.service';

class AddController {

  constructor($routeParams) {
    // playlist name from url or defaults.
    this.listName = $routeParams.list || config.defaults.PLAYLIST;
  }
}

AddController.$inject = ['$routeParams'];

angular
  .module('app.subscribe')
  .controller('SubscriptionAddController', AddController);

export default AddController;
