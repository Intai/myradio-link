import google from '../../core/services/google.service';

class AuthGoogle {

  constructor() {
    this.restrict = 'A';
    this.controller = AuthGoogleController;
    this.controllerAs = 'auth';
    this.bindToController = true;
    this.link = AuthGoogleLink.factory;
  }

  static factory() {
    return new AuthGoogle();
  }
}

class AuthGoogleController {}

class AuthGoogleLink {

  constructor(scope, element, attrs) {
    // setup class variables.
    this.initVars(element);
    // setup event bindings.
    this.initEvents();
  }

  /**
   * Class Variables
   */

  initVars(element, animate) {
    /**
     * jQuery element to be aniamted.
     * @type {object}
     */
    this.el = element;
  }

  /**
   * Event Bindings
   */

  initEvents() {
    this.el
      // triggered by user interaction.
      .on('click', this._onClick);
  }

  /**
   * Private
   */

  _onClick() {
    // authenticate with google.
    google.authPopup();
  }

  static factory() {
    return new AuthGoogleLink(...arguments);
  }
}

angular
  .module('app.core')
  .directive('rdAuthGoogle', AuthGoogle.factory);

export default AuthGoogle;
export {AuthGoogleController, AuthGoogleLink};
