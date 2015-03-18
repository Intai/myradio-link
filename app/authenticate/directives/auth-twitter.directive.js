import twitterApi from '../../core/services/twitter.service';

class AuthTwitter {

  constructor() {
    this.restrict = 'A';
    this.controller = AuthTwitterController;
    this.controllerAs = 'auth';
    this.bindToController = true;
    this.require = 'rdAuthTwitter';
    this.link = AuthTwitterLink.factory;
  }

  static factory() {
    return new AuthTwitter();
  }
}

class AuthTwitterController {

  constructor(...args) {
    // setup public functions.
    this.initPublicFuncs(...args);
  }

  /**
   * Public
   */

  initPublicFuncs($scope, $location, $attrs) {
    /**
     * Authenticate with twitter through popup.
     */
    this.authPopup = _.bind(_.partial(this._authPopup,
      $scope, $location, $attrs.href), this);

    /**
     * Authenticate with twitter through redirect.
     */
    this.authRedirect = _.bind(_.partial(this._authRedirect,
      $scope, $location, $attrs.href), this);
  }

  /**
   * Private
   */

  _authPopup(...args) {
    // authenticate with twitter.
    twitterApi.authPopup()
      .then(_.partial(this._redirect, ...args));
  }

  _authRedirect(...args) {
    // authenticate with twitter.
    twitterApi.authRedirect()
      .then(_.partial(this._redirect, ...args));
  }

  _redirect($scope, $location, redirect) {
    if (redirect) {
      // redirect after authenticated successfully.
      $location.path(redirect).replace();
      $scope.$apply();
    }
  }
}

class AuthTwitterLink {

  constructor(scope, element, attrs, authTwitter) {
    // setup class variables.
    this.initVars(element, authTwitter);
    // setup event bindings.
    this.initEvents();
  }

  /**
   * Class Variables
   */

  initVars(element, authTwitter) {
    /**
     * jQuery element to be aniamted.
     * @type {object}
     */
    this.el = element;

    /**
     * AuthTwitter directive controller.
     * @type {object}
     */
    this.authTwitter = authTwitter;
  }

  /**
   * Event Bindings
   */

  initEvents() {
    this.el
      // triggered by user interaction.
      .on('click', this.authTwitter.authPopup);
  }

  static factory(...args) {
    return new AuthTwitterLink(...args);
  }
}

AuthTwitterController.$inject = ['$scope', '$location', '$attrs'];

angular
  .module('app.core')
  .directive('rdAuthTwitter', AuthTwitter.factory);

export default AuthTwitter;
export {AuthTwitterController, AuthTwitterLink};
