import dispatcher from '../../core/services/dispatcher.service';
import config from '../../core/services/config.service';
import common from '../../core/services/common.service';
import playback from '../../playback/playback.module';
import playlist from '../../playback/services/playlist.service';

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
      episode: '=',
      feedUrl: '@'
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
    // link to the associated subscription.
    this.episode.feedUrl = this.feedUrl;

    // whether the episode is in the current playlist.
    this.addedProperty = playlist.currentListProperty
      .map(_.property('entries'))
      .map(common.findWhere({link: this.episode.link}));
    // show plus or minus icon.
    this.added = common.getBaconPropValue(this.addedProperty);
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
     * @type {object}
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
      .on('mouseup dragend touchend', _.partial(this._onUp, this.animate))
      // when selecting the episode.
      .on('click', _.partial(this._onClick, this.scope));

    // whether the episode has been added or removed from playlist.
    var dispose = this.scope.item.addedProperty.changes()
      .onValue(_.partial(this._onAdded, this.scope));

    // unbind on destroy.
    this.scope.$on('$destroy', () => {
      this.el.off();
      dispose();
    });
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
    var actionType = (scope.item.added)
      ? config.actions.FEED_REMOVE_EPISODE
      : config.actions.FEED_ADD_EPISODE;

    // dispatch to add the selected episode.
    dispatcher.dispatch({
      actionType: actionType,
      episode: scope.item.episode
    });
  }

  _onAdded(scope, added) {
    scope.item.added = !!added;
    scope.$digest();
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
