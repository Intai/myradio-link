import common from '../services/common.service';
import navigate from '../services/navigation.service';
import dispatcher from '../services/dispatcher.service';
import config from '../services/config.service';

class Navigation {

  constructor() {
    this.restrict = 'E';
    this.replace = true;
    this.transclude = true;
    this.templateUrl = '/core/directives/navigation.directive.html';
    this.controller = NavigationController;
    this.controllerAs = 'nav';
    this.bindToController = true;
    this.link = NavigationLink.factory;
    this.scope = {
      title: '@',
      disableHistoryBack: '&',
      enableDefaultBack: '&',
      defaultBackHref: '@',
      defaultBackTitle: '@'
    };
  }

  static factory() {
    return new Navigation();
  }
}

class NavigationController {

  constructor($location) {
    // current url path.
    this.href = $location.path();

    // if there is no previous url and title.
    if (this.enableDefaultBack() && this.defaultBackHref) {
      // setup default back anchor.
      this.back = {
        href: this.defaultBackHref,
        title: this.defaultBackTitle
      };
    }
  }
}

class NavigationLink {

  constructor(scope, element, attrs) {
    // setup class variables.
    this.initVars(scope, element);
    // setup event bindings.
    this.initEvents();
    // dispatch actions on init.
    this.dispatchActions(scope);
  }

  /**
  * Class Variables
  */

  initVars(scope, element) {
    /**
     * Angular directive scope.
     */
    this.scope = scope;

    /**
     * jQuery element of navigation.
     * @type {object}
     */
    this.el = $(element);
  }

  /**
   * Event Bindings
   */

  initEvents() {
    var dispose = null;

    this.el
      // navigate back in history.
      .on('click vclick', '.nav-back', this._onBack);

    if (!this.scope.nav.disableHistoryBack()) {
      // get the previous url and title.
      dispose = navigate.backProperty.changes().take(1)
        .onValue(_.partial(this._onUpdateBack, this.scope));
    }

    // unbind on destroy.
    this.scope.$on('$destroy', () => {
      this.el.off();
      if (dispose) {
        dispose();
      }
    });
  }

  /**
   * Dispatch Actions
   */

  dispatchActions(scope) {
    // dispatch when navigation happens.
    dispatcher.dispatch({
      actionType: config.actions.NAVIGATE,
      to: {
        href: scope.nav.href,
        title: scope.nav.title
      }
    });
  }

  /**
   * Private
   */

  _onUpdateBack(scope, back) {
    if (back) {
      scope.nav.back = back;
      scope.$digest();
    }
  }

  _onBack() {
    // dispatch to navigate back in history.
    dispatcher.dispatch({
      actionType: config.actions.NAVIGATE_BACK
    });
  }

  static factory(...args) {
    return new NavigationLink(...args);
  }
}

NavigationController.$inject = ['$location'];

angular
  .module('app.core')
  .directive('rdNav', Navigation.factory);

export default Navigation;
export {NavigationController, NavigationLink};
