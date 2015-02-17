var core = angular
  .module('app.core', []);

import anchor from './directives/anchor.directive';
import button from './directives/button.directive';
import animate from './directives/animate.directive';
import firebase from './services/firebase.service';
import google from './services/google.service';

export default core;
