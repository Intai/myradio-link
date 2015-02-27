import config from '../../core/services/config.service';

class SubscriptionController {

  constructor($routeParams) {
    // playlist name from url or defaults.
    this.listName = $routeParams.list || config.defaults.PLAYLIST;
  }
}

SubscriptionController.$inject = ['$routeParams'];

angular
  .module('app.subscribe')
  .controller('SubscriptionController', SubscriptionController);

export default SubscriptionController;
