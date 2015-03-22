var playback = angular
  .module('app.playback', [
    'ngAnimate',
    'ngSanitize']);

import playlist from './directives/playlist.directive';
import episode from './directives/episode.directive';
import playing from './directives/playback.directive';
import episodeInfo from './directives/episode-info.directive';
import listData from './services/playlist.service';
import listView from './views/list.controller';
import episodeView from './views/episode.controller';

export default playback;
