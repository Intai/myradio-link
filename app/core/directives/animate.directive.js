class Animate {

  constructor() {
    this.restrict = 'A';
    this.controller = AnimateController;
    this.controllerAs = 'vm';
    this.bindToController = true;
  }

  static factory() {
    return new Animate();
  }
}

class AnimateController {

  constructor($element, $attrs, browser) {
    this.el = $element;
    this.isLoop = false;
    this.isReverse = false;
    this.isBackward = false;
    this.isRunning = false;
    this.frames = [];
    this.curr = -1;
    this.timer = null;
    this.isEnabled = browser
      .supportCssTransition();
  }

  addFrame(className) {
    this.frames.push(className);
  }

  reset(index) {
    if (this.frames.length > 0) {
      if (this.curr >= 0) {
        this.el.removeClass(this.frames[this.curr]);
      }

      // reset to a specific frame.
      if (typeof(index) != 'undefined') {
        index = parseInt(index);
        if (index in this.frames) {
          this.el.addClass(this.frames[index]);
          this.curr = index;
        }
      }
      // reset to initial state.
      else {
        this.isBackward = false;
        this.curr = -1;
      }
    }
  }

  clear() {
    if (this.frames.length > 0) {
      if (this.curr >= 0) {
        this.el.removeClass(this.frames[this.curr]);
      }

      // remove all frames.
      this.isBackward = false;
      this.frames = [];
      this.curr = -1;
    }
  }

  loop(isLoop) {
    this.isLoop = (typeof(isLoop) != 'undefined')
      ? (isLoop && isLoop != 'false')
      : true;
  }

  reverse(isReverse) {
    this.isReverse = (typeof(isReverse) != 'undefined')
      ? (isReverse && isReverse != 'false')
      : true;

    // if setting reverse on the last frame, animate backward.
    if (this.isReverse) {
      if (this.curr == (this.frames.length - 1)) {
        this.isBackward = true;
      }
    }
  }

  start() {
    if (!this.isEnabled) {
      return;
    }

    if (!this.isRunning) {
      // start the animation.
      this.isRunning = true;
      this.timer = setTimeout(() => this.tick, 10);
    }
  }

  stop() {
    // stop after the current frame finishes.
    clearTimeout(this.timer);
    this.isRunning = false;
  }

  restart() {
    this.stop();
    this.start();
  }

  _tick() {
    clearTimeout(this.timer);
    var next = -1;

    // animating backward.
    if (this.isBackward) {
      // next frame.
      if (this.curr > 0) {
        next = this.curr - 1;
      }
      else {
        if (this.isLoop && this.frames.length > 1) {
          // loop to the second frame.
          next = 1;
        }
        // switch to forward.
        this.isBackward = false;
      }
    }
    // forward.
    else {
      // next frame.
      if (this.curr < this.frames.length - 1) {
        next = this.curr + 1;
      }
      else if (this.frames.length > 1) {
        // switch to backward.
        if (this.isReverse) {
          next = this.frames.length - 2;
          this.isBackward = true;
        }
        // loop to the first frame.
        else if (this.isLoop) {
          next = 0;
        }
      }
    }

    if (next >= 0) {
      // apply the next frame.
      this.el.addClass(this.frames[next]);
      if (this.curr >= 0) {
        this.el.removeClass(this.frames[this.curr]);
      }
      // set as the current frame.
      this.curr = next;

      // schedule at the end of the frame.
      var duration = this._getCurrDuration();
      if (duration > 0) {
        this.timer = setTimeout(() => this.tick,
          duration + MIN_DURATION);
      }
      else {
        this.timer = setTimeout(() => this.tick, 0);
      }
    }
    else {
      // the end of animation.
      this.isRunning = false;
    }
  }

  _getCurrDuration() {
    // get arrays of transition properties.
    var duration = this._getCurrTransProp('transition-duration');
    var delay = this._getCurrTransProp('transition-delay');

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

  _getCurrTransProp(name) {
    var property =
      this.el.css(name)
        || this.el.css('-o-' + name)
        || this.el.css('-moz-' + name)
        || this.el.css('-webkit-' + name);

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
}

AnimateController.$inject = ['$element', '$attrs', 'browser'];

var core = angular
  .module('app.core')
  .directive('rdAnimate', Animate.factory);
