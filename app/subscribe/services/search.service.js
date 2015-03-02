import dispatcher from '../../core/services/dispatcher.service';
import appleApi from '../../core/services/apple.service';
import config from '../../core/services/config.service';

class SearchService {

  constructor() {
    // setup class variables.
    this.initVars();
    // setup action handlers.
    this.initActionHandlers();
  }

  /**
   * Class Variables
   */

  initVars() {
    /**
     * Stream out search terms.
     * @type {object}
     */
    this.termStream = new Bacon.Bus();
    this.termProperty = this.termStream.toProperty('');
    this.termProperty.onValue();

    /**
     * Stream out search results.
     * @type {object}
     */
    this.resultStream = new Bacon.Bus();
    this.resultProperty = this.resultStream.toProperty({});
    this.resultProperty.onValue();
  }

  /**
   * Action Handlers
   */

  initActionHandlers() {
    // search podcast action from dispatcher.
    dispatcher.register(config.actions.SEARCH_PODCAST,
      _.bind(_.partial(this._searchActionHandler,
        this.termStream, this.resultStream), this));
  }

  /**
   * Private
   */

  _searchActionHandler(termStream, resultStream, payload) {
    // extract search term from action payload.
    this._search(termStream, resultStream, payload.searchTerm);
  }

  _search(termStream, resultStream, term) {
    // search for podcasts on itunes.
    appleApi.searchPodcast(term)
      // push result out through the bacon bus.
      .then((data) => {
        termStream.push(term);
        resultStream.push(data);
      });
  }

  static factory() {
    return new SearchService();
  }
}

angular
  .module('app.subscribe')
  .factory('search', SearchService.factory);

export default SearchService.factory();
