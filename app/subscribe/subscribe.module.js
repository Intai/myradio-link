var subscribe = angular
  .module('app.subscribe', [
    'ngAnimate']);

import searchForm from './directives/search.directive';
import searchItem from './directives/search-item.directive';
import search from './services/search.service';
import listView from './views/list.controller';
import searchView from './views/search.controller';
import subscribeView from './views/subscribe.controller';

export default subscribe;
