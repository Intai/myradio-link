import browser from '../services/browser.service';
import common from '../services/common.service';
import config from '../services/config.service';

class Animate {

  constructor() {
    this.restrict = 'A';
    this.controller = AnimateController;
    this.controllerAs = 'animate';
    this.bindToController = true;
  }

  static factory() {
    return new Animate();
  }
}

class AnimateController {

  constructor($element, $attrs) {
    // setup class variables.
    this.initVars(...arguments);
    // setup public functions.
    this.initPublicFuncs();
    // setup initial keyframes.
    this.addFrame($attrs.keyframes);
  }

  /**
   * Class Variables
   */

  initVars($element, $attrs) {
    /**
     * jQuery element to be aniamted.
     * @type {object}
     */
    this.el = $($element);

    /**
     * Current state of the animation.
     * @type {object}
     */
    this.state = {
      /**
       * Whether css transition is supported.
       * @type {bool}
       */
      isEnabled: browser.supportCssTransition(),

      /**
       * Whether to loop the animation.
       * @type {bool}
       */
      isLoop: false,

      /**
       * Whether to reverse the animation.
       * @type {bool}
       */
      isReverse: false,

      /**
       * Whether currently animating backward.
       * @type {bool}
       */
      isBackward: false,

      /**
       * Whether currently animating.
       * @type {bool}
       */
      isRunning: false,

      /**
       * Index of the current keyframe.
       * @type {integer}
       */
      curr: -1
    };

    /**
     * Keyframes.
     * @type {array}
     */
    this.frames = [];

    /**
     * Timer to loop the animation.
     * @type {integer}
     */
    this.timer = {id: null};
  }

  /**
   * Public
   */

  initPublicFuncs() {
    /**
     * Add a css class as keyframe.
     * @param {string} className
     */
    this.addFrame = common.chainable(_.partial(this._addFrame,
      this.frames));

    /**
     * Reset the animation to a keyframe.
     * @param {integer} index
     */
    this.reset = common.chainable(_.partial(this._reset,
      this.el, this.state, this.frames));

    /**
     * Remove all the keyframes.
     */
    this.clear = common.chainable(_.partial(this._clear,
      this.el, this.state, this.frames));

    /**
     * Start the animation.
     */
    this.start = common.chainable(_.partial(this._start,
      this.state, this.timer, _.partial(this._tick,
        this.el, this.state, this.frames, this.timer)));

    /**
     * Stop the animation.
     */
    this.stop = common.chainable(_.partial(this._stop,
      this.state, this.timer));

    /**
     * Restart the animation.
     */
    this.restart = common.chainable(_.compose(this.start, this.stop));

    /**
     * Loop the animation.
     * @type {bool} isLoop
     */
    this.setLoop = common.chainable(_.partial(this._setLoop,
      this.state));

    /**
     * Reverse the animation.
     * @type {bool} isReverse
     */
    this.setReverse = common.chainable(_.partial(this._setReverse,
      this.state, this.frames));
  }

  /**
   * Getters/Setters
   */

  get loop() {
    return this.state.isLoop;
  }

  get reverse() {
    return this.state.isReverse;
  }

  /**
   * Private
   */

  _addFrame(frames, className) {
    var classNames = className.split(',');
    frames.push(...classNames);
  }

  _reset(el, state, frames, index) {
    if (frames.length > 0) {
      if (state.curr >= 0) {
        el.removeClass(frames[state.curr]);
      }

      // reset to a specific frame.
      if (typeof(index) != 'undefined') {
        index = parseInt(index);
        if (index in frames) {
          el.addClass(frames[index]);
          state.curr = index;
        }
      }
      // reset to initial state.
      else {
        state.isBackward = false;
        state.curr = -1;
      }
    }
  }

  _clear(el, state, frames) {
    if (frames.length > 0) {
      if (state.curr >= 0) {
        el.removeClass(frames[state.curr]);
      }

      // remove all frames.
      state.isBackward = false;
      state.curr = -1;
      frames = [];
    }
  }

  _start(state, timer, tick) {
    if (!state.isEnabled) {
      return;
    }

    if (!state.isRunning) {
      // start the animation.
      state.isRunning = true;
      timer.id = setTimeout(() => tick.call(this), 10);
    }
  }

  _stop(state, timer) {
    // stop after the current frame finishes.
    clearTimeout(timer.id);
    state.isRunning = false;
  }

  _tick(el, state, frames, timer) {
    clearTimeout(timer.id);
    var next = -1;

    // animating backward.
    if (state.isBackward) {
      // next frame.
      if (state.curr > 0) {
        next = state.curr - 1;
      }
      else {
        if (state.isLoop && frames.length > 1) {
          // loop to the second frame.
          next = 1;
        }
        // switch to forward.
        state.isBackward = false;
      }
    }
    // forward.
    else {
      // next frame.
      if (state.curr < frames.length - 1) {
        next = state.curr + 1;
      }
      else if (frames.length > 1) {
        // switch to backward.
        if (state.isReverse) {
          next = frames.length - 2;
          state.isBackward = true;
        }
        // loop to the first frame.
        else if (state.isLoop) {
          next = 0;
        }
      }
    }

    if (next >= 0) {
      // apply the next frame.
      el.addClass(frames[next]);
      if (state.curr >= 0) {
        el.removeClass(frames[state.curr]);
      }
      // set as the current frame.
      state.curr = next;

      // schedule at the end of the frame.
      var duration = this._getCurrDuration(el);
      if (duration > 0) {
        timer.id = setTimeout(() => this._tick(...arguments),
          duration + config.CORE_ANIMATE_MIN_DURATION);
      }
      else {
        timer.id = setTimeout(() => this._tick(...arguments), 0);
      }
    }
    else {
      // the end of animation.
      state.isRunning = false;
    }
  }

  _getCurrDuration(el) {
    // get arrays of transition properties.
    var duration = this._getCurrTransProp(el, 'transition-duration');
    var delay = this._getCurrTransProp(el, 'transition-delay');

    // get the maximum duration and delay combined.
    var max = 0;
    for (var i in duration) {
      var val = duration[i] + delay[i];
      if (val > max) {
        max = val;
      }
    }

    return max;
  }

  _getCurrTransProp(el, name) {
    var property =
      el.css(name)
        || el.css('-o-' + name)
        || el.css('-moz-' + name)
        || el.css('-webkit-' + name);

    // split the property string (e.g. 100ms, 1s, 0.5s)
    // into an array of milliseconds.
    var ret = [];
    var ary = property.split(',');
    for (var i in ary) {
      var val = ary[i];
      var idx = val.search('ms');
      if (idx >= 0) {
        ret.push(val.substring(0, idx));
      } else {
        idx = val.search('s');
        if (idx >= 0) {
          ret.push(val.substring(0, idx) * 1000);
        }
      }
    }

    return ret;
  }

  _setLoop(state, isLoop) {
    state.isLoop = (isLoop && isLoop !== 'false');
  }

  _setReverse(state, frames, isReverse) {
    state.isReverse = (isReverse && isReverse != 'false');

    // if setting reverse on the last frame, animate backward.
    if (state.isReverse && state.curr == (frames.length - 1)) {
      state.isBackward = true;
    }
  }
}

AnimateController.$inject = ['$element', '$attrs'];

angular
  .module('app.core')
  .directive('rdAnimate', Animate.factory);

export default Animate;
export {AnimateController};
