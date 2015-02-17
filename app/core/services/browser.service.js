class BrowserService {

  constructor() {
    this.support = {};
  }

  supportCssTransition() {
    if (!('cssTransition' in this.support)) {
      var style = document.body.style,
          match = navigator.userAgent.match(/android ([.\d^\s]+)/i);

      // whether css transition is supported.
      // css transition performance is low on older androids.
      this.support.cssTransition = (
        !(match && match.length > 1 && parseFloat(match[1]) < 2.3)
          && (typeof style.Transition != 'undefined'
            || typeof style.OTransition != 'undefined'
            || typeof style.MozTransition != 'undefined'
            || typeof style.WebkitTransition != 'undefined'));
    }

    return this.support.cssTransition;
  }

  static factory() {
    return new BrowserService();
  }
}

angular
  .module('app.core')
  .factory('browser', BrowserService.factory);
