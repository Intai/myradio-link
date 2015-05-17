import dispatcher from '../services/dispatcher.service';
import config from '../services/config.service';
import common from '../services/common.service';

class AudioService {

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
     * Stream out audio source.
     * @type {bacon.bus}
     */
    this.audioStream = new Bacon.Bus();
    this.audioProperty = this.audioStream.toProperty(null);
    this.audioProperty.onValue();
  }

  /**
  * Action Handlers
  */

  initActionHandlers() {
    // register to receive audio source.
    dispatcher.register(config.actions.AUDIO_LOAD,
      _.partial(this._onLoad, this.audioStream));

    // register action type to play/pause the current audio source.
    dispatcher.register(config.actions.AUDIO_PLAY,
      _.bind(this._onPlay, this));
    dispatcher.register(config.actions.AUDIO_PAUSE,
      _.bind(this._onPause, this));
    dispatcher.register(config.actions.PLAYBACK_REWIND,
      _.bind(this._onRewind, this));
    dispatcher.register(config.actions.PLAYBACK_FORWARD,
      _.bind(this._onForward, this));
  }

  /**
   * Getters/Setters
   */

  get source() {
    return common.getBaconPropValue(this.audioProperty);
  }

  /**
   * Private
   */

  _onLoad(stream, payload) {
    stream.push(payload.source);
  }

  _onPlay() {
    var source = this.source;
    if (source) {
      source.play();
    }
  }

  _onPause() {
    var source = this.source;
    if (source) {
      source.pause();
    }
  }

  _onRewind() {
    var source = this.source;
    if (source) {
      source.currentTime -= 60;
    }
  }

  _onForward() {
    var source = this.source;
    if (source) {
      source.currentTime += 60;
    }
  }

  static factory() {
    return new AudioService();
  }
}

  angular
    .module('app.core')
    .factory('audio', AudioService.factory);

  export default AudioService.factory();
