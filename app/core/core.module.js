var core = angular
  .module('app.core', []);

import vector from './libs/math/vector';
import matrix from './libs/math/matrix';
import rectangle from './libs/math/rect';
import anchor from './directives/anchor.directive';
import button from './directives/button.directive';
import icon from './directives/button-icon.directive';
import spinner from './directives/spinner.directive';
import dialogue from './directives/message.directive';
import textinput from './directives/text-input.directive';
import pageTitle from './directives/page-title.directive';
import nav from './directives/navigation.directive';
import audio from './directives/audio.directive';
import animate from './behaviours/animate.directive';
import matrixApply from './behaviours/matrix.directive';
import group from './behaviours/group.directive';
import pan from './behaviours/pan.directive';
import vclick from './behaviours/vclick.directive';
import slideReveal from './behaviours/slide-reveal.directive';
import dispatcher from './services/dispatcher.service';
import browser from './services/browser.service';
import common from './services/common.service';
import config from './services/config.service';
import firebase from './services/firebase.service';
import googleApi from './services/google.service';
import appleApi from './services/apple.service';
import twitterApi from './services/twitter.service';
import facebookApi from './services/facebook.service';
import loading from './services/loading.service';
import message from './services/message.service';
import groups from './services/group.service';
import navigate from './services/navigation.service';
import audioPlay from './services/audio.service';

export default core;
