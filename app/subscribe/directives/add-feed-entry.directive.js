import dispatcher from '../../core/services/dispatcher.service';
import config from '../../core/services/config.service';
import common from '../../core/services/common.service';

class AddFeedEntry {

  constructor() {
    this.restrict = 'E';
    this.replace = true;
    this.transclude = false;
    this.templateUrl = '/subscribe/directives/add-feed-entry.directive.html';
    this.controller = AddFeedEntryController;
    this.controllerAs = 'item';
    this.bindToController = true;
    this.require = 'rdAnimate';
    this.link = AddFeedEntryLink.factory;
    this.scope = {
      episode: '='
    };
  }

  static factory() {
    return new AddFeedEntry();
  }
}

class AddFeedEntryController {

  constructor() {
    // create date object from the published date string.
    this.episode.publishedDateObject = new Date(this.episode.publishedDate);
  }
}

class AddFeedEntryLink {

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
     */
    this.scope = scope;

    /**
     * jQuery element.
     * @type {object}
     */
    this.el = element;

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
      .on('mouseup drag touchend', _.partial(this._onUp, this.animate))
      // when selecting the episode.
      .on('click', _.partial(this._onClick, this.scope));
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

  _onClick(scope) {
    // dispatch to add the selected episode.
    dispatcher.dispatch({
      actionType: config.actions.FEED_ADD_EPISODE,
      episode: scope.item.episode
    });
  }

  static factory(...args) {
    return new AddFeedEntryLink(...args);
  }
}

angular
  .module('app.subscribe')
  .directive('rdAddFeedEntry', AddFeedEntry.factory);

export default AddFeedEntry;
export {AddFeedEntryController, AddFeedEntryLink};
