import Vec from './vector';

class Matrix {

  constructor(ary) {
    if (typeof(ary) == 'undefined') {
      ary = [1,0,0,0,1,0,0,0,1];
    }

    // in column-major order.
    this.m = ary;
  }

  clone() {
    return Matrix.create(this.m.slice(0));
  }


  multiply(mtx) {
    // multiply mtx on the left.
    this.m[0] = this.m[0] * mtx.m[0] + this.m[1] * mtx.m[3] + this.m[2] * mtx.m[6];
    this.m[1] = this.m[0] * mtx.m[1] + this.m[1] * mtx.m[4] + this.m[2] * mtx.m[7];
    this.m[2] = this.m[0] * mtx.m[2] + this.m[1] * mtx.m[5] + this.m[2] * mtx.m[8];
    this.m[3] = this.m[3] * mtx.m[0] + this.m[4] * mtx.m[3] + this.m[5] * mtx.m[6];
    this.m[4] = this.m[3] * mtx.m[1] + this.m[4] * mtx.m[4] + this.m[5] * mtx.m[7];
    this.m[5] = this.m[3] * mtx.m[2] + this.m[4] * mtx.m[5] + this.m[5] * mtx.m[8];
    this.m[6] = this.m[6] * mtx.m[0] + this.m[7] * mtx.m[3] + this.m[8] * mtx.m[6];
    this.m[7] = this.m[6] * mtx.m[1] + this.m[7] * mtx.m[4] + this.m[8] * mtx.m[7];
    this.m[8] = this.m[6] * mtx.m[2] + this.m[7] * mtx.m[5] + this.m[8] * mtx.m[8];
    return this;
  }

  translate(ary) {
    this.m[6] = ary[0];
    this.m[7] = ary[1];
    return this;
  }

  scale(ary) {
    this.m[0] = ary[0];
    this.m[4] = ary[1];
    return this;
  }

  inverseTrans() {
    this.m[6] = -this.m[6];
    this.m[7] = -this.m[7];
    return this;
  }

  to2d() {
    return this.m[0].toFixed(10) + ',' + this.m[1].toFixed(10) + ',' +
    this.m[3].toFixed(10) + ',' + this.m[4].toFixed(10) + ',' +
    this.m[6].toFixed(10) + ',' + this.m[7].toFixed(10);
  }

  to3d() {
    return this.m[0].toFixed(10) + ',' + this.m[1].toFixed(10) + ',0,' + this.m[2].toFixed(10) + ',' +
    this.m[3].toFixed(10) + ',' + this.m[4].toFixed(10) + ',0,' + this.m[5].toFixed(10) + ',0,0,1,0,' +
    this.m[6].toFixed(10) + ',' + this.m[7].toFixed(10) + ',1,' + this.m[8].toFixed(10);
  }

  set(ary) {
    this.m = ary;
  }

  static create(ary) {
    return new Matrix(ary);
  }

  static createFromCss(value) {
    // parse the css matrix value.
    var matches = value.match(/matrix(3d)?\(([^)]+)\)/i);

    if (matches && matches.length > 2) {
      // turn into an array.
      var ary = matches[2].split(',');

      // matrix3d.
      if (matches[1] == '3d') {
        return new Matrix([
          parseFloat(ary[0]), parseFloat(ary[1]), parseFloat(ary[3]),
          parseFloat(ary[4]), parseFloat(ary[5]), parseFloat(ary[7]),
          parseFloat(ary[12]), parseFloat(ary[13]), parseFloat(ary[15])]);
      }
      // matrix.
      else {
        return new Matrix([
          parseFloat(ary[0]), parseFloat(ary[1]), 0,
          parseFloat(ary[2]), parseFloat(ary[3]), 0,
          parseFloat(ary[4]), parseFloat(ary[5]), 1]);
      }
    }

    return null;
  }
}

export default Matrix;
