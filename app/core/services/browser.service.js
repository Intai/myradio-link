class BrowserService {

  constructor() {
    // cache feature detection.
    this.support = {};

    // cache vender event names.
    this.events = {};

    // css prefixes.
    this.prefixes = ['', '-webkit-', '-moz-', '-ms-', '-o-'];
    this.properties = {};
  }

  supportTouch() {
    if (!('touch' in this.support)) {
      // whether on touch device
      this.support.touch = ('ontouchstart' in window);
    }

    return this.support.touch;
  }

  supportTranslate3d() {
    if (!('cssTranslate3d' in this.support)) {
      // whether translate3d is supported.
      this.support.cssTranslate3d = ('WebKitCSSMatrix' in window
        && 'm42' in new WebKitCSSMatrix());
    }

    return this.support.cssTranslate3d;
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

  eventTransitionEnd() {
    if (!('transitionEnd' in this.events)) {
      // transition end event name.
      if ('onwebkittransitionend' in window) {
        this.events.transitionEnd = 'webkitTransitionEnd';
      } else if ('onotransitionend' in window) {
        this.events.transitionEnd = 'oTransitionEnd';
      } else {
        this.events.transitionEnd = 'transitionend';
      }
    }

    return this.events.transitionEnd;
  }

  cssPrefix(property, fallback) {
    // if the property has been detected before.
    if (property in this.properties) {
      return this.properties[property];
    }
    else {
      // detect if the property is supported with prefixes.
      var style = document.body.style;
      for (var i in this.prefixes) {
        var name = this.prefixes[i] + property;
        if (name in style) {
          this.properties[property] = name;
          return name;
        }
      }
    }

    return (typeof(fallback) === 'undefined')
      ? property : fallback;
  }

  cssMatrix(matrix) {
    // apply matrix.
    return (this.supportTranslate3d())
      ? `matrix3d(${matrix.to3d()})`
      : `matrix(${matrix.to2d()})`;
  }

  cssTranslate(x, y) {
    // translate 2d/3d.
    return (this.supportTranslate3d())
      ? `translate3d(${x}px,${y}px,0)`
      : `translate(${x}px,${y}px)`;
  }

  cssTranslate3d(x, y, z) {
    if (this.supportTranslate3d()) {
      // translate 3d.
      return `translate3d(${x}px,${y}px,${z}px)`;
    }

    return '';
  }

  cssScale(scale) {
    // scale 2d/3d.
    return (this.supportTranslate3d())
      ? `scale3d(${scale},${scale},1)`
      : `scale(${scale},${scale})`;
  }

  static factory() {
    return new BrowserService();
  }
}

angular
  .module('app.core')
  .factory('browser', BrowserService.factory);

export default BrowserService.factory();
