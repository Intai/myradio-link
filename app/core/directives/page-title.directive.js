class PageTitle {

  constructor() {
    this.restrict = 'E';
    this.replace = true;
    this.transclude = true;
    this.templateUrl = '/core/directives/page-title.directive.html';
  }

  static factory() {
    return new PageTitle();
  }
}

angular
  .module('app.core')
  .directive('rdPageTitle', PageTitle.factory);

export default PageTitle;
