var subscribe = angular
  .module('app.subscribe', [
    'ngAnimate']);

import searchForm from './directives/search.directive';
import searchItem from './directives/search-item.directive';
import subscribeFeed from './directives/subscribe-feed.directive';
import addFeedEntry from './directives/add-feed-entry.directive';
import subscription from './directives/subscription.directive';
import subscriptionItem from './directives/subscription-item.directive';
import search from './services/search.service';
import feed from './services/feed.service';
import listView from './views/list.controller';
import searchView from './views/search.controller';
import subscribeView from './views/subscribe.controller';

export default subscribe;
