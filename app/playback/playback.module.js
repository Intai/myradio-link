var playback = angular
  .module('app.playback', [
    'ngAnimate']);

import playlist from './directives/playlist.directive';
import listData from './services/playlist.service';
import listView from './views/list.controller';

export default playback;
