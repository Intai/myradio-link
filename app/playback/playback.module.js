var playback = angular
  .module('app.playback', [
    'ngAnimate']);

import playlist from './directives/playlist.directive';
import episode from './directives/episode.directive';
import playing from './directives/playback.directive';
import listData from './services/playlist.service';
import listView from './views/list.controller';

export default playback;
