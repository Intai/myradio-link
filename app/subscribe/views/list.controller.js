class SubscriptionController {

  constructor($routeParams, defaults) {
    // playlist name from url or defaults.
    this.listName = $routeParams.list || defaults.PLAYLIST;
  }
}

SubscriptionController.$inject = ['$routeParams', 'defaults'];

angular
  .module('app.subscribe')
  .controller('SubscriptionController', SubscriptionController);

export default SubscriptionController;
