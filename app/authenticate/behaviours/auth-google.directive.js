import googleApi from '../../core/services/google.service';

class AuthGoogle {

  constructor() {
    this.restrict = 'A';
    this.controller = AuthGoogleController;
    this.controllerAs = 'auth';
    this.bindToController = true;
    this.require = 'rdAuthGoogle';
    this.link = AuthGoogleLink.factory;
  }

  static factory() {
    return new AuthGoogle();
  }
}

class AuthGoogleController {

  constructor(...args) {
    // setup public functions.
    this.initPublicFuncs(...args);
  }

  /**
   * Public
   */

  initPublicFuncs($scope, $location, $attrs) {
    /**
     * Authenticate with google through popup.
     */
    this.authPopup = _.bind(_.partial(this._authPopup,
      $scope, $location, $attrs.href), this);

    /**
     * Authenticate with google through redirect.
     */
    this.authRedirect = _.bind(_.partial(this._authRedirect,
      $scope, $location, $attrs.href), this);
  }

  /**
   * Private
   */

  _authPopup(...args) {
    // authenticate with google.
    googleApi.authPopup()
      .then(_.partial(this._redirect, ...args));
  }

  _authRedirect(...args) {
    // authenticate with google.
    googleApi.authRedirect()
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

class AuthGoogleLink {

  constructor(scope, element, attrs, authGoogle) {
    // setup class variables.
    this.initVars(element, authGoogle);
    // setup event bindings.
    this.initEvents();
  }

  /**
   * Class Variables
   */

  initVars(element, authGoogle) {
    /**
     * jQuery element to be aniamted.
     * @type {object}
     */
    this.el = element;

    /**
     * AuthGoogle directive controller.
     * @type {object}
     */
    this.authGoogle = authGoogle;
  }

  /**
   * Event Bindings
   */

  initEvents() {
    this.el
      // triggered by user interaction.
      .on('click', this.authGoogle.authPopup);
  }

  static factory(...args) {
    return new AuthGoogleLink(...args);
  }
}

AuthGoogleController.$inject = ['$scope', '$location', '$attrs'];

angular
  .module('app.core')
  .directive('rdAuthGoogle', AuthGoogle.factory);

export default AuthGoogle;
export {AuthGoogleController, AuthGoogleLink};
