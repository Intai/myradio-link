import config from '../../core/services/config.service';

class AppleService {

  searchPodcast(term) {
    return new Promise((resolve, reject) => {
      var url = config.urls.ITUNES_SEARCH_PODCAST + encodeURIComponent(term);

      $.ajax({
        url: url,
        type: 'get',
        dataType: 'jsonp',
        success: resolve,
        error: reject
      });
    });
  }

  static factory() {
    return new AppleService();
  }
}

angular
  .module('app.core')
  .factory('appleApi', AppleService.factory);

export default AppleService.factory();
