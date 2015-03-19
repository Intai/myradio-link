class Episode {

  constructor() {
    this.restrict = 'E';
    this.replace = true;
    this.transclude = false;
    this.templateUrl = '/playback/directives/episode.directive.html';
    this.controller = EpisodeController;
    this.controllerAs = 'item';
    this.bindToController = true;
    this.require = 'rdAnimate';
    this.link = EpisodeLink.factory;
    this.scope = {
      episode: '='
    };
  }

  static factory() {
    return new Episode();
  }
}

class EpisodeController {

  constructor() {
    // create date object from the published date string.
    this.episode.publishedDateObject = new Date(this.episode.publishedDate);
  }
}

class EpisodeLink {

  constructor(scope, element, attrs, animate) {
    // setup class variables.
    this.initVars(scope, element, animate);
    // setup event bindings.
    this.initEvents();
  }

  /**
   * Class Variables
   */

  initVars(scope, element, animate) {
    /**
     * Angular directive scope.
     * @type {object}
     */
    this.scope = scope;

    /**
     * jQuery element.
     * @type {object}
     */
    this.el = $(element);

    /**
     * Animate directive controller.
     * @type {object}
     */
    this.animate = animate;
  }

  /**
   * Event Bindings
   */

  initEvents() {
    this.el
      // down state.
      .on('mousedown touchstart', _.partial(this._onDown, this.animate))
      // up state.
      .on('mouseup dragend touchend', _.partial(this._onUp, this.animate));

    // unbind on destroy.
    this.scope.$on('$destroy', () => this.el.off());
  }

  /**
   * Private
   */

  _onDown(animate) {
    animate
      .reset(0)
      .setReverse(false)
      .restart();
  }

  _onUp(animate) {
    animate
      .setReverse(true)
      .start();
  }

  static factory(...args) {
    return new EpisodeLink(...args);
  }
}

angular
  .module('app.playback')
  .directive('rdEpisode', Episode.factory);

export default Episode;
export {EpisodeController, EpisodeLink};
