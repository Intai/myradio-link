import facebookApi from '../../core/services/facebook.service';

class AuthFacebook {

  constructor() {
    this.restrict = 'A';
    this.controller = AuthFacebookController;
    this.controllerAs = 'auth';
    this.bindToController = true;
    this.require = 'rdAuthFacebook';
    this.link = AuthFacebookLink.factory;
  }

  static factory() {
    return new AuthFacebook();
  }
}

class AuthFacebookController {

  constructor(...args) {
    // setup public functions.
    this.initPublicFuncs(...args);
  }

  /**
   * Public
   */

  initPublicFuncs($scope, $location, $attrs) {
    /**
     * Authenticate with facebook through popup.
     */
    this.authPopup = _.bind(_.partial(this._authPopup,
      $scope, $location, $attrs.href), this);

    /**
     * Authenticate with facebook through redirect.
     */
    this.authRedirect = _.bind(_.partial(this._authRedirect,
      $scope, $location, $attrs.href), this);
  }

  /**
   * Private
   */

  _authPopup(...args) {
    // authenticate with facebook.
    facebookApi.authPopup()
      .then(_.partial(this._redirect, ...args));
  }

  _authRedirect(...args) {
    // authenticate with facebook.
    facebookApi.authRedirect()
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

class AuthFacebookLink {

  constructor(scope, element, attrs, authFacebook) {
    // setup class variables.
    this.initVars(element, authFacebook);
    // setup event bindings.
    this.initEvents();
  }

  /**
   * Class Variables
   */

  initVars(element, authFacebook) {
    /**
     * jQuery element to be aniamted.
     * @type {object}
     */
    this.el = element;

    /**
     * AuthFacebook directive controller.
     * @type {object}
     */
    this.authFacebook = authFacebook;
  }

  /**
   * Event Bindings
   */

  initEvents() {
    this.el
      // triggered by user interaction.
      .on('click', this.authFacebook.authPopup);
  }

  static factory(...args) {
    return new AuthFacebookLink(...args);
  }
}

AuthFacebookController.$inject = ['$scope', '$location', '$attrs'];

angular
  .module('app.core')
  .directive('rdAuthFacebook', AuthFacebook.factory);

export default AuthFacebook;
export {AuthFacebookController, AuthFacebookLink};
