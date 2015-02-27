var core = angular
  .module('app.core', []);

import anchor from './directives/anchor.directive';
import button from './directives/button.directive';
import icon from './directives/button-icon.directive';
import animate from './directives/animate.directive';
import browser from './services/browser.service';
import common from './services/common.service';
import config from './services/config.service';
import firebase from './services/firebase.service';
import googleApi from './services/google.service';
import appleApi from './services/apple.service';

export default core;
