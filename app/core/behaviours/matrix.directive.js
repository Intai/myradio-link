import Mtx from '../libs/math/matrix';
import common from '../services/common.service';

class MatrixApply {

  constructor() {
    this.restrict = 'A';
    this.controller = MatrixApplyController;
    this.controllerAs = 'matrix';
    this.bindToController = true;
  }

  static factory() {
    return new MatrixApply();
  }
}

class MatrixApplyController {

  constructor() {
    // setup class variables.
    this.initVars();
    // setup public functions.
    this.initPublicFuncs();
  }

  /**
   * Class Variables
   */

  initVars() {
    // initial matrix.
    this.init = null;
    // boundary matrices.
    this.boundaries = [null];
    // matrix to be applied on the element.
    this.current = Mtx.create();
  }

  /**
   * Public
   */

  initPublicFuncs() {
    /**
     * Add a boundary matrix for snapping.
     * @param {matrix} matrix
     */
    this.addBoundaryMatrix = common.chainable(_.partial(this._addBoundaryMatrix,
      this.boundaries));
  }

  /**
   * Private
   */

  _addBoundaryMatrix(boundaries, matrix) {
    boundaries.push(matrix);
  }
}

angular
  .module('app.core')
  .directive('rdMatrix', MatrixApply.factory);

export default MatrixApply;
export {MatrixApplyController};
