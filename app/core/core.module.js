var core = angular
  .module('app.core', []);

import anchor from './directives/anchor.directive';
import button from './directives/button.directive';
import icon from './directives/button-icon.directive';
import spinner from './directives/spinner.directive';
import dialogue from './directives/message.directive';
import textinput from './directives/text-input.directive';
import nav from './directives/navigation.directive';
import animate from './behaviour/animate.directive';
import dispatcher from './services/dispatcher.service';
import browser from './services/browser.service';
import common from './services/common.service';
import config from './services/config.service';
import firebase from './services/firebase.service';
import googleApi from './services/google.service';
import appleApi from './services/apple.service';
import loading from './services/loading.service';
import message from './services/message.service';
import navigate from './services/navigation.service';

export default core;
