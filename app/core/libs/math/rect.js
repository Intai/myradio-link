import Vec from './vector';

class Rect {

  constructor(ary) {
    if (typeof(ary) == 'undefined') {
      ary = [0,0,0,0];
    }

    // left, top, right, bottom.
    this.r = ary;
  }

  clone() {
    return Rect.create(this.r.slice(0));
  }

  tension(rect, vec) {
    // check if over boundaries of rect.
    var isOverBound = false;
    var tension = [0, 0];

    // left.
    if (this.r[0] > rect.r[0]) {
      tension[0] = -vec.v[0] / 2;
      isOverBound = true;
    }
    // right.
    else if (this.r[2] < rect.r[2]) {
      tension[0] = -vec.v[0] / 2;
      isOverBound = true;
    }
    // top.
    if (this.r[1] > rect.r[1]) {
      tension[1] = -vec.v[1] / 2;
      isOverBound = true;
    }
    // bottom.
    else if (this.r[3] < rect.r[3]) {
      tension[1] = -vec.v[1] / 2;
      isOverBound = true;
    }

    // return the tension vector array
    // or false if not over boundaries of rect.
    return (isOverBound) ? tension : false;
  }

  snap(rect, axis) {
    if (typeof(axis) != 'number') {
      axis = Rect.AXIS_XY;
    }

    // check if over boundaries of rect.
    var isOverBound = false;
    var snap = [0, 0];

    if (axis & Rect.AXIS_X) {
      // left.
      if (this.r[0] > rect.r[0]) {
        snap[0] = rect.r[0] - this.r[0];
        isOverBound = true;

        var right = rect.r[2] - this.r[2];
        if (snap[0] < right) {
          snap[0] = (snap[0] + right) / 2;
        }
      }
      // right.
      else if (this.r[2] < rect.r[2]) {
        snap[0] = rect.r[2] - this.r[2];
        isOverBound = true;

        var left = rect.r[0] - this.r[0];
        if (snap[0] > left) {
          snap[0] = (snap[0] + left) / 2;
        }
      }
    }
    if (axis & Rect.AXIS_Y) {
      // top.
      if (this.r[1] > rect.r[1]) {
        snap[1] = rect.r[1] - this.r[1];
        isOverBound = true;

        var bottom = rect.r[3] - this.r[3];
        if (snap[1] < bottom) {
          snap[1] = (snap[1] + bottom) / 2;
        }
      }
      // bottom.
      else if (this.r[3] < rect.r[3]) {
        snap[1] = rect.r[3] - this.r[3];
        isOverBound = true;

        var top = rect.r[1] - this.r[1];
        if (snap[1] > top) {
          snap[1] = (snap[1] + top) / 2;
        }
      }
    }

    return (isOverBound && (snap[0] || snap[1])) ? snap : false;
  }

  bounce(rect, vec, offset) {
    // check if over boundaries of rect.
    var isOverBound = false;
    var v1 = [0,0], v2 = [0,0], v3 = [0,0], v4 = [0,0];

    // left.
    if (this.r[0] > rect.r[0]) {
      let tan = vec.v[1] / vec.v[0];
      v1[0] = rect.r[0] - this.r[0];

      if (v1[0] > -offset) {
        v2[0] = v1[0];
        v2[1] = -v1[0] * tan;
        v1[0] = 0;
        v1[1] = 0;
      }
      else {
        v1[0] += offset;
        v1[1] = v1[0] * tan;
        v2[0] = -offset;
        v2[1] = offset * tan;
      }

      isOverBound = true;
    }
    // right.
    else if (this.r[2] < rect.r[2]) {
      let tan = vec.v[1] / vec.v[0];
      v1[0] = rect.r[2] - this.r[2];

      if (v1[0] < offset) {
        v2[0] = v1[0];
        v2[1] = -v1[0] * tan;
        v1[0] = 0;
        v1[1] = 0;
      }
      else {
        v1[0] -= offset;
        v1[1] = v1[0] * tan;
        v2[0] = offset;
        v2[1] = -offset * tan;
      }

      isOverBound = true;
    }
    // top.
    if (this.r[1] > rect.r[1]) {
      let tan = vec.v[0] / vec.v[1];
      v3[1] = rect.r[1] - this.r[1];

      if (v3[1] > -offset) {
        v4[1] = v1[1];
        v4[0] = -v1[1] * tan;
        v3[1] = 0;
        v3[0] = 0;
      }
      else {
        v3[1] += offset;
        v3[0] = v3[1] * tan;
        v4[1] = -offset;
        v4[0] = offset * tan;
      }

      isOverBound = true;
    }
    // bottom.
    else if (this.r[3] < rect.r[3]) {
      let tan = vec.v[0] / vec.v[1];
      v3[1] = rect.r[3] - this.r[3];

      if (v3[1] < offset) {
        v4[1] = v3[1];
        v4[0] = -v3[1] * tan;
        v3[1] = 0;
        v3[0] = 0;
      }
      else {
        v3[1] -= offset;
        v3[0] = v3[1] * tan;
        v4[1] = offset;
        v4[0] = -offset * tan;
      }

      isOverBound = true;
    }

    if (isOverBound) {
      var len1 = Vec.create(v1).length();
      var len3 = Vec.create(v3).length();

      // pick the closer boundary to bounce off.
      if (len1 > len3) {
        return [v1, v2];
      } else {
        return [v3, v4];
      }
    }
    else {
      return false;
    }
  }

  matrix(mtx) {
    this.r[0] = mtx.m[0] * this.r[0] + mtx.m[3] * this.r[1] + mtx.m[6];
    this.r[1] = mtx.m[1] * this.r[0] + mtx.m[4] * this.r[1] + mtx.m[7];
    this.r[2] = mtx.m[0] * this.r[2] + mtx.m[3] * this.r[3] + mtx.m[6];
    this.r[3] = mtx.m[1] * this.r[2] + mtx.m[4] * this.r[3] + mtx.m[7];
    return this;
  }

  get width() {
    return this.r[2] - this.r[0];
  }

  get height() {
    return this.r[3] - this.r[1];
  }

  static create(ary) {
    return new Rect(ary);
  }

  static createFromDimension(ary) {
    var right = ary[0] >> 1;
    var bottom = ary[1] >> 1;

    return new Rect([-right, -bottom, right, bottom]);
  }
}

Rect.AXIS_X = 1;
Rect.AXIS_Y = 2;
Rect.AXIS_XY = 3;

export default Rect;
