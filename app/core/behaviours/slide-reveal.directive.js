class SlideReveal {

  constructor() {
    this.restrict = 'A';
    this.controller = SlideRevealController;
    this.controllerAs = 'reveal';
    this.bindToController = true;
    this.link = SlideRevealLink.factory;
    this.require = 'rdPan';
  }

  static factory() {
    return new SlideReveal();
  }
}

class SlideRevealController {

  constructor($attrs) {
    // class name of the content to be revealed.
    this.revealContent = $attrs.revealContent;
  }
}

class SlideRevealLink {

  constructor(scope, element, attrs, pan) {

  }

  static factory(...args) {
    return new SlideRevealLink(...args);
  }
}

SlideRevealController.$inject = ['$attrs'];

angular
  .module('app.core')
  .directive('rdSlideReveal', SlideReveal.factory);

export default SlideReveal;
export {SlideRevealController, SlideRevealLink};
