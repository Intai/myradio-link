var authenticate = angular
  .module('app.authenticate', [
    'ngAnimate']);

import authGoogle from './directives/auth-google.directive';
import loginCtrl from './views/login.controller';

export default authenticate;