import audio from '../services/audio.service';
import dispatcher from '../services/dispatcher.service';
import config from '../services/config.service';

class Audio {

  constructor() {
    this.restrict = 'E';
    this.replace = true;
    this.transclude = false;
    this.templateUrl = '/core/directives/audio.directive.html';
    this.controller = AudioController;
    this.controllerAs = 'audio';
    this.bindToController = true;
    this.link = AudioLink.factory;
    this.scope = {
      source: '=',
      play: '='
    };
  }

  static factory() {
    return new Audio();
  }
}

class AudioController {

  constructor($scope, $element, $sce) {
    // when setting/updating audio source.
    $scope.$watch('audio.source', (url) => {
      // trust audio source as url.
      this.sourceUrl = (url) ? $sce.trustAsResourceUrl(url) : '';
    });

    // when playing/pausing the source.
    $scope.$watch('audio.play',
      _.partial(this.updatePlay, $element));
  }

  updatePlay($element, play) {
    var element = $element[0];
    var actionType = (play)
      ? config.actions.AUDIO_PLAY
      : config.actions.AUDIO_PAUSE;

    // ios requires audio control in
    // event triggered by user action.
    if (play) {
      element.play();
    } else {
      element.pause();
    }

    // notify audio service to pause/resume the current source.
    dispatcher.dispatch({
      actionType: actionType
    });
  }
}

class AudioLink {

  constructor(scope, element, attrs) {
    // setup class variables.
    this.initVars(element);
    // dispatch actions on init.
    this.dispatchActions();
  }

  /**
   * Class Variables
   */

  initVars(element) {
    /**
     * jQuery element.
     */
    this.el = element;
  }

  /**
   * Dispatch Actions
   */

  dispatchActions() {
    // dispatch the audio source.
    dispatcher.dispatch({
      actionType: config.actions.AUDIO_LOAD,
      source: this.el[0]
    });
  }

  /**
   * Private
   */

  static factory(...args) {
    return new AudioLink(...args);
  }
}

AudioController.$inject = ['$scope', '$element', '$sce'];

angular
  .module('app.core')
  .directive('rdAudio', Audio.factory);

export default Audio;
export {AudioController, AudioLink};