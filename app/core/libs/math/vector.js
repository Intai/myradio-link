class Vector {

  constructor(ary) {
    if (typeof(ary) == 'undefined') {
      ary = [0,0];
    }

    // x, y.
    this.v = ary;
  }

  clone() {
    return Vector.create(this.v.slice(0));
  }

  add(vec) {
    this.v[0] += vec.v[0];
    this.v[1] += vec.v[1];
    return this;
  }

  inverse() {
    this.v[0] = -this.v[0];
    this.v[1] = -this.v[1];
    return this;
  }

  length() {
    var x = this.v[0];
    var y = this.v[1];
    return Math.sqrt(x*x + y*y);
  }

  normal() {
    var len = this.length();
    this.v[0] /= len;
    this.v[1] /= len;
    return this;
  }

  substract(vec) {
    this.v[0] -= vec.v[0];
    this.v[1] -= vec.v[1];
    return this;
  }

  multiply(vec) {
    this.v[0] *= vec.v[0];
    this.v[1] *= vec.v[1];
    return this;
  }

  multiplyScalar(s) {
    this.v[0] *= s;
    this.v[1] *= s;
    return this;
  }

  divide(vec) {
    if (vec.v[0] !== 0) {
      this.v[0] /= vec.v[0];
    }
    if (vec.v[1] !== 0) {
      this.v[1] /= vec.v[1];
    }
    return this;
  }

  divideScalar(s) {
    if (s !== 0) {
      this.v[0] /= s;
      this.v[1] /= s;
    }
    return this;
  }

  dot(vec) {
    return this.v[0] * vec.v[0] + this.v[1] * vec.v[1];
  }

  distance(vec) {
    var x = this.v[0] - vec.v[0];
    var y = this.v[1] - vec.v[1];
    return Math.sqrt(x*x + y*y);
  }

  matrix(mtx) {
    this.v[0] = mtx.m[0] * this.v[0] + mtx.m[3] * this.v[1] + mtx.m[6];
    this.v[1] = mtx.m[1] * this.v[0] + mtx.m[4] * this.v[1] + mtx.m[7];
    return this;
  }

  direction() {
    // calculate cosin to the x axis.
    var axis = Vector.create([1,0]);
    var cos = axis.dot(this) / axis.length() / this.length();

    if (!isNaN(cos)) {
      // determine which one of the four axes
      // is closer to the vector directionally.
      if (cos > 0.5) {
        return Vector.DIR_POS_X;
      }
      else if (cos < -0.5) {
        return Vector.DIR_NEG_X;
      }
      else if (this.v[1] > 0) {
        return Vector.DIR_POS_Y;
      }
      else {
        return Vector.DIR_NEG_Y;
      }
    }

    return Vector.DIR_NONE;
  }

  set(ary) {
    this.v = ary;
  }

  set x(x) {
    this.v[0] = x;
  }

  set y(y) {
    this.v[1] = y;
  }

  get x() {
    return this.v[0];
  }

  get y() {
    return this.v[1];
  }

  static create(ary) {
    return new Vector(ary);
  }

  static createFromCss(value) {
    // parse the css translate value.
    var matches = value.match(/translate(3d)?\(([^)]+)\)/i);

    if (matches && matches.length > 2) {
      // turn into an array.
      var ary = matches[2].split(',');

      return new Vector([
        parseFloat(ary[0]), parseFloat(ary[1])]);
    }

    return null;
  }
}

Vector.DIR_NONE  = 1;
Vector.DIR_POS_X = 2;
Vector.DIR_POS_Y = 3;
Vector.DIR_NEG_X = 4;
Vector.DIR_NEG_Y = 5;

export default Vector;
