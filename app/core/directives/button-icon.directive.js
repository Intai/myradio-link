import {ButtonController, ButtonLink} from './button.directive';

class ButtonIcon {

  constructor() {
    this.restrict = 'E';
    this.replace = true;
    this.transclude = true;
    this.templateUrl = '/core/directives/button-icon.directive.html';
    this.controller = ButtonController;
    this.controllerAs = 'button';
    this.bindToController = true;
    this.require = 'rdAnimate';
    this.link = ButtonLink.factory;
    this.scope = {
        type: '@',
        large: '&'
    };
  }

  static factory() {
    return new ButtonIcon();
  }
}

angular
  .module('app.core')
  .directive('rdButtonIcon', ButtonIcon.factory);

export default ButtonIcon;
