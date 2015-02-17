class Anchor {

  constructor() {
    this.restrict = 'E';
    this.replace = true;
    this.transclude = true;
    this.templateUrl = '/core/directives/anchor.directive.html';
    this.controller = AnchorController;
    this.controllerAs = 'vm';
    this.bindToController = true;
    this.scope = {
        href: '@'
    };
  }

  static factory() {
    return new Anchor();
  }
}

class AnchorController {

    constructor() {

    }
}

var core = angular
  .module('app.core')
  .directive('rdAnchor', Anchor.factory);