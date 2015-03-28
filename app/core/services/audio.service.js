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
    dispatcher.register(config.actions.PLAYBACK_PLAY,
      _.bind(_.partial(this._onPlay, this.audioProperty), this));
    dispatcher.register(config.actions.PLAYBACK_PAUSE,
      _.bind(_.partial(this._onPause, this.audioProperty), this));
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
    payload.source.play();
  }

  _onPlay(property) {
    var source = this.source;
    if (source) {
      source.play();
    }
  }

  _onPause(property) {
    var source = this.source;
    if (source) {
      source.pause();
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
