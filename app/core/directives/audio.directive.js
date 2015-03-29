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
      source: '@',
      play: '='
    };
  }

  static factory() {
    return new Audio();
  }
}

class AudioController {

  constructor($scope, $sce) {
    if (this.source) {
      // trust audio source as url.
      this.sourceUrl = $sce.trustAsResourceUrl(this.source);
    }

    // when setting/updating audio source.
    $scope.$watch('audio.play', (play) => {
      let actionType = (play)
        ? config.actions.AUDIO_PLAY
        : config.actions.AUDIO_PAUSE;

      // notify audio service to pause/resume the current source.
      dispatcher.dispatch({
        actionType: actionType
      });
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

AudioController.$inject = ['$scope', '$sce'];

angular
  .module('app.core')
  .directive('rdAudio', Audio.factory);

export default Audio;
export {AudioController, AudioLink};
