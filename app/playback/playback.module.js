var playback = angular
  .module('app.playback', [
    'ngAnimate',
    'ngSanitize']);

import playlist from './directives/playlist.directive';
import episode from './directives/episode.directive';
import playing from './directives/playback.directive';
import episodeInfo from './directives/episode-info.directive';
import listStore from './services/playlist.service';
import playStore from './services/playback.service';
import listView from './views/list.controller';
import episodeView from './views/episode.controller';

export default playback;
