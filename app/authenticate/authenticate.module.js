var authenticate = angular
  .module('app.authenticate', [
    'ngAnimate']);

import authGoogle from './directives/auth-google.directive';
import authTwitter from './directives/auth-twitter.directive';
import authFacebook from './directives/auth-facebook.directive';

export default authenticate;