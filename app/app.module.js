var app = angular
  .module('app', [
    'ngRoute',
    'app.templates',
    'app.core',
    'app.playback',
    'app.subscribe',
    'app.authenticate']);

import consts from './app.constants';
import config from './app.config';
import core from './core/core.module';
import authenticate from './authenticate/authenticate.module';
import subscribe from './subscribe/subscribe.module';
import playback from './playback/playback.module';
import routes from './app.routes';

export default app;
