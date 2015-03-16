import Rct from '../libs/math/rect';
import Vec from '../libs/math/vector';
import Mtx from '../libs/math/matrix';
import config from '../services/config.service';
import browser from '../services/browser.service';

var CSS_TRANSFORM = browser.cssPrefix('transform'),
    CSS_TRANSITION = browser.cssPrefix('transition'),
    CSS_TRANSITION_TIMING = 'ms cubic-bezier(0.33, 0.66, 0.66, 1)',
    MAX_VELOCITY_ANGLE = Math.cos(30),
    MIN_MOVES_DRAGGING = 1,
    MIN_VELOCITY = 1,
    MAX_VELOCITY = 3.5,
    MOMENTUM = 0.0025,
    TIME_SHIFT = 400,
    TIME_BOUNCE = 500,
    OFFSET_BOUNCE = 75;

class Pan {

  constructor() {
    this.restrict = 'A';
    this.controller = PanController;
    this.controllerAs = 'pan';
    this.bindToController = true;
    this.link = PanLink.factory;
    this.require = 'rdMatrix';
  }

  static factory() {
    return new Pan();
  }
}

class PanController {

  constructor() {
    // default vector to shift the element.
    this.shiftVector = Vec.create();
    // stream out shift/unshift vector.
    this.shiftStream = new Bacon.Bus();
  }

  shift() {
    this.shiftStream.push(this.shiftVector);
  }

  unshift() {
    this.shiftStream.push(
      this.shiftVector.clone().inverse());
  }
}

class PanLink {

  constructor(scope, element, attrs, matrix) {
    // setup class variables.
    this.initVars(scope, element, matrix);
    // setup event bindings.
    this.initEvents();
  }

  /**
   * Class Variables
   */

  initVars(scope, element, matrix) {
    /**
     * Angular directive scope.
     */
    this.scope = scope;

    /**
     * jQuery element.
     * @type {object}
     */
    this.el = $(element);

    /**
     * Current state of the panning.
     * @type {object}
     */
    this.state = {
      /**
       * Matrix to be applied.
       * @type {matrix}
       */
      matrix: matrix,

      /**
       * Configurations.
       */
      direction: config.enums.DIR_HORIZONTAL,
      momentum: MOMENTUM,

      /**
       * Track touch states.
       */
      prevTouchId: false,
      prevPoint: Vec.create(),
      cntMoves: 0,
      endMoves: 0,
      endDuration: 0,
      endDiff: 0,
      prevMs: 0,
      bounceDiff: 0,
      isOverBound: false
    };
  }

  /**
   * Event Bindings
   */

  initEvents() {
    var element = this.el.get(0),
        eventTransitionEnd = browser.eventTransitionEnd();

    var onTouchStart = _.bind(_.partial(
      this._onTouchStart, element, this.state), this);
    var onTouchMove = _.bind(_.partial(
      this._onTouchMove, element, this.state), this);
    var onTouchEnd = _.bind(_.partial(
      this._onTouchEnd, element, this.state), this);
    var onTransitionEnd = _.bind(_.partial(
      this._onTransitionEndEvent, element, this.state), this);

    // listen to touch events.
    element.addEventListener('touchstart', onTouchStart, false);
    element.addEventListener('touchmove', onTouchMove, false);
    element.addEventListener('touchleave', onTouchEnd, false);
    element.addEventListener('touchend', onTouchEnd, false);
    element.addEventListener('click', onTouchEnd, false);

    // transition end event.
    element.addEventListener(eventTransitionEnd, onTransitionEnd, false);

    // shift vector.
    var dispose = this.scope.pan.shiftStream.onValue(
      _.bind(_.partial(this._onShift, element, this.state), this));

    // unbind on destroy.
    this.scope.$on('$destroy', () => {
      element.removeEventListener('touchstart', onTouchStart);
      element.removeEventListener('touchmove', onTouchMove);
      element.removeEventListener('touchleave', onTouchMove);
      element.removeEventListener('touchend', onTouchEnd);
      element.removeEventListener('click', onTouchEnd);
      element.removeEventListener(eventTransitionEnd, onTransitionEnd);
      dispose();
    });
  }

  /**
   * Private
   */

  _onTouchStart(target, state, e) {
    var touch, touchIdentifier;

    if ('touches' in e) {
      touch = e.touches[0];
      touchIdentifier = touch.identifier;
    }
    else {
      touch = e;
      touchIdentifier = 0;
    }

    // interrupt the current transition if there is one.
    if (this._stopTransition(target, state)) {
      // prevent clicking on anything.
      e.preventDefault();
    }

    // clean up states for touch start.
    state.prevPoint.set([touch.clientX, touch.clientY]);
    state.prevTouchId = touchIdentifier;
    state.cntMoves = 0;
    state.endMoves = 0;
    state.endDuration = 0;
    state.endDiff = 0;
    state.bounceDiff = 0;
    state.isOverBound = false;

    // record time for calculating touch velocty later.
    state.prevMs = (new Date()).getTime();
  }

  _onTouchMove(target, state, e) {
    var touch, touchIdentifier,
        direction = false;

    if ('touches' in e) {
      touch = e.touches[0];
      touchIdentifier = touch.identifier;
    }
    else {
      touch = e;
      touchIdentifier = 0;
    }

    // make sure it's still the same touch.
    if (state.prevTouchId === false
      || state.prevTouchId === touchIdentifier) {
      // calculate the difference to the previous point.
      var diff = Vec
        .create([touch.clientX, touch.clientY])
        .substract(state.prevPoint);

      // touch move direction.
      direction = diff.direction();

      // restrict movement direction.
      switch (state.direction) {
        case config.enums.DIR_HORIZONTAL:
          diff.v[1] = 0;
          break;
        case config.enums.DIR_VERTICAL:
          diff.v[0] = 0;
          break;
      }

      // translate on top of the existing matrix.
      state.matrix.current.multiply(Mtx.create().translate(diff.v));

      // if dragging over boundaries, apply tension
      // to give the feeling of pulling back.
      this._applyTension(target, state, diff);

      // move the associated content.
      target.style[CSS_TRANSFORM] = browser.cssMatrix(state.matrix.current);
      state.prevPoint.set([touch.clientX, touch.clientY]);

      // calculate cosine between the average of
      // previous directions and this move direction.
      var cos = false;
      if (state.endDiff) {
        var endDiff = state.endDiff;
        cos = endDiff.dot(diff) / endDiff.length() / diff.length();
      }

      var currMs = (new Date()).getTime();

      // if within 30 degrees.
      if (cos && cos > MAX_VELOCITY_ANGLE) {
        // add to the end vector.
        state.endDuration = currMs - state.prevMs;
        state.endDiff.add(diff);
        state.endMoves ++;
      }
      // otherwise, reset the end vector.
      else {
        state.prevMs = currMs;
        state.endDuration = 0;
        state.endDiff = diff;
        state.endMoves = 0;
      }

      state.cntMoves ++;
    }

    if (this._isPanDirectionAlign(state, direction)) {
      // prevent native scrolling from happening.
      e.preventDefault();
    }
  }

  _onTouchEnd(target, state, e) {
    var hasTouch = ('touches' in e && e.touches.length > 0);

    // if all fingers are off the screen
    // and the target has been dragged.
    if (!hasTouch && this._hasDragged(state)) {
      // if there is momentum at the end of dragging.
      if (this._hasMomentum(state)) {
        // decelerate to stop according to the end velocity.
        this._slide(target, state);
      }
      else {
        // snap back to boundaries if required.
        this._snapToBound(target, state);
      }

      // prevent default clicking behaviour.
      e.preventDefault();
    }
  }

  _onTransitionEndEvent(target, state, e) {
    if (this._onTransitionEnd) {
      this._onTransitionEnd(target, state);
    }
  }

  _onShift(target, state, vector) {
    // shift the current matrix with the vector.
    state.matrix.current.multiply(Mtx.create().translate(vector.v));

    // calculate vector to snap the shifted
    // rectangle to contain the original rectangle.
    var snap = this._calcMinVecTransformed(target, state,
      (transformed, rect) => transformed.snap(rect));

    // if target is over boundaries.
    state.isOverBound = (snap !== false);
    if (state.isOverBound) {
      // snap back to boundaries.
      state.matrix.current.multiply(Mtx.create().translate(snap));
    }

    // shift in a fixed time
    target.style[CSS_TRANSITION] = CSS_TRANSFORM + ' ' + TIME_SHIFT + CSS_TRANSITION_TIMING;
    target.style[CSS_TRANSFORM] = browser.cssMatrix(state.matrix.current);

    // stop at the end of transition.
    this._onTransitionEnd = this._endTransition;
  }

  _slide(target, state) {
    var t = state.endDuration,
        d = state.endDiff,
        v = d.clone().divideScalar(t),
        a = d.clone().normal().inverse().multiplyScalar(state.momentum);

    // maximum velocity.
    if (v.length() > MAX_VELOCITY) {
      v.normal().multiplyScalar(MAX_VELOCITY);
    }

    // calculate the vector to slide.
    var diff = v.clone()
      .multiply(v).divide(a).divideScalar(-2);

    // slide on top of the existing matrix.
    state.matrix.current.multiply(Mtx.create().translate(diff.v));

    var time = 0;

    // calculate vectors to bounce off boundaries.
    var bounce = this._calcMinVecTransformed(target, state,
      (transformed, rect) => transformed.bounce(rect, diff, OFFSET_BOUNCE));

    // if sliding over boundaries, don't continue
    // sliding. stop at the boundaries.
    state.isOverBound = (bounce !== false);
    if (state.isOverBound) {
      state.matrix.current.multiply(Mtx.create().translate(bounce[0]));
      time = Vec.create(bounce[0]).add(diff).divide(v).length();

      // bounce back to boundaries at the end of transition.
      this._onTransitionEnd = this._bounceToBound;
      state.bounceDiff = Vec.create(bounce[1]);
    }
    else {
      // stop at the end of transition.
      this._onTransitionEnd = this._endTransition;
    }

    if (!time) {
      // calculate the time required to decelerate to stop
      // according to touch velocity and acceleration.
      time = v.clone().divide(a).length();
    }

    // slide the associated content to stop.
    target.style[CSS_TRANSITION] = CSS_TRANSFORM + ' ' + time + CSS_TRANSITION_TIMING;
    target.style[CSS_TRANSFORM] = browser.cssMatrix(state.matrix.current);
  }

  _bounceToBound(target, state) {
    if (state.bounceDiff) {
      // apply the bounce vector.
      state.matrix.current.multiply(Mtx.create().translate(state.bounceDiff.v));
      // bounce back to boundaries in a fixed time.
      target.style[CSS_TRANSITION] = CSS_TRANSFORM + ' ' + TIME_BOUNCE + CSS_TRANSITION_TIMING;
      target.style[CSS_TRANSFORM] = browser.cssMatrix(state.matrix.current);

      // stop at the end of transition.
      this._onTransitionEnd = this._endTransition;
    }
  }

  _snapToBound(target, state) {
    // calculate vector to snap the current
    // rectangle to contain the original rectangle.
    var snap = this._calcMinVecTransformed(target, state,
      (transformed, rect) => transformed.snap(rect));

    // if target is over boundaries.
    state.isOverBound = (snap !== false);
    if (state.isOverBound) {
      // snap to boundaries in a fixed time.
      state.matrix.current.multiply(Mtx.create().translate(snap));
      target.style[CSS_TRANSITION] = CSS_TRANSFORM + ' ' + TIME_BOUNCE + CSS_TRANSITION_TIMING;
      target.style[CSS_TRANSFORM] = browser.cssMatrix(state.matrix.current);

      // stop at the end of transition.
      this._onTransitionEnd = this._endTransition;
    }
  }

  _applyTension(target, state, diff) {
    // calculate tension vector between the current and original rectangle.
    var tension = this._calcMinVecTransformed(target, state,
      (transformed, rect) => transformed.tension(rect, diff));

    // whether target is dragged over boundaries.
    state.isOverBound = (tension !== false);

    // if dragging over boundaries, make the dragging distance
    // shorter to give the feeling of pulling back to boundaries.
    if (state.isOverBound) {
      state.matrix.current.multiply(Mtx.create().translate(tension));
    }
  }

  _calcMinVecTransformed(target, state, calcVec) {
    var rect = Rct.createFromDimension([target.clientWidth, target.clientHeight]),
        boundaries = state.matrix.boundaries;

    // calculate vectors from the transformed rectangle.
    var vectors = _.map(boundaries, (matrix) => {
      // transform the current rectangle.
      let transformed = rect.clone().matrix(state.matrix.current);
      // calculate boundary rectangle.
      let boundary = (matrix) ? rect.clone().matrix(matrix) : rect;

      return calcVec(transformed, boundary);
    });

    // return the minimum vector calculated.
    return _.min(vectors, this._calcVecLength);
  }

  _calcVecLength(ary) {
    // if it's a 2d array. e.g. bounce.
    if (ary && _.isArray(ary[0])) {
      // take the first array.
      ary = ary[0];
    }

    return (ary)
      ? Vec.create(ary).length()
      : Number.MIN_VALUE;
  }

  _stopTransition(target, state) {
    // if in the progress of decelerating to stop.
    if (target.style[CSS_TRANSITION].length > 0) {
      // get the current computed style object.
      var style = window.getComputedStyle(target, null);
      // get the the transform matrix.
      var matrix = style[CSS_TRANSFORM];

      // clear the active transition so it doesn't apply to our next transform.
      target.style[CSS_TRANSITION] = '';
      this._onTransitionEnd = null;
      // transform the target to where it is right now.
      state.matrix.current = Mtx.createFromCss(matrix);
      target.style[CSS_TRANSFORM] = browser.cssMatrix(state.matrix.current);

      return true;
    }

    // nothing to interrupt.
    return false;
  }

  _endTransition(target, state) {
    target.style[CSS_TRANSITION] = '';
    state._onTransitionEnd = null;
  }

  _isPanDirectionAlign(state, direction) {
    return (state.direction === config.enums.DIR_ALL
      || (state.direction === config.enums.DIR_HORIZONTAL
        && (direction === Vec.DIR_POS_X || direction === Vec.DIR_NEG_X))
      || (state.direction === config.enums.DIR_VERTICAL
        && (direction === Vec.DIR_POS_Y || direction === Vec.DIR_NEG_Y)));
  }

  _hasDragged(state) {
    return (state.cntMoves > 0);
  }

  _hasMomentum(state) {
    return (state.endDuration > 0
      && state.endMoves > MIN_MOVES_DRAGGING
      && (state.endDiff.length() / state.endDuration) > MIN_VELOCITY);
  }

  static factory(...args) {
    return new PanLink(...args);
  }
}

angular
  .module('app.core')
  .directive('rdPan', Pan.factory);

export default Pan;
export {PanController, PanLink};
