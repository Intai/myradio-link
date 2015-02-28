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

  constructor() {
    // setup public functions.
    this.initPublicFuncs(...arguments);
  }

  /**
   * Public
   */

  initPublicFuncs($scope, $location, $attrs) {
    /**
     * Authenticate with google through popup.
     */
    this.authPopup = _.partial(this._authPopup,
      $scope, $location, $attrs.href);
  }

  /**
   * Private
   */

  _authPopup($scope, $location, redirect) {
    // authenticate with google.
    googleApi.authPopup()
      .then(() => {
        if (redirect) {
          // redirect after authenticated successfully.
          $location.path(redirect).replace();
          $scope.$apply();
        }
      });
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

  static factory() {
    return new AuthGoogleLink(...arguments);
  }
}

AuthGoogleController.$inject = ['$scope', '$location', '$attrs'];

angular
  .module('app.core')
  .directive('rdAuthGoogle', AuthGoogle.factory);

export default AuthGoogle;
export {AuthGoogleController, AuthGoogleLink};
