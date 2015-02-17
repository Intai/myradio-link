class Animate {

  constructor() {
    this.restrict = 'A';
    this.controller = AnimateController;
    this.controllerAs = 'vm';
    this.bindToController = true;
  }

  static factory() {
    return new Animate();
  }
}

class AnimateController {

  constructor($element, $attrs) {
    console.log('animate');
    console.log($attrs);
  }

  start() {

  }
  
  reset() {

  }

  reverse() {

  }

  restart() {

  }
}

AnimateController.$inject = ['$element', '$attrs'];

var core = angular
  .module('app.core')
  .directive('rdAnimate', Animate.factory);