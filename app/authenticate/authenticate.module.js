var authenticate = angular
  .module('app.authenticate', [
    'ngAnimate']);

import authGoogle from './behaviours/auth-google.directive';
import authTwitter from './behaviours/auth-twitter.directive';
import authFacebook from './behaviours/auth-facebook.directive';

export default authenticate;
