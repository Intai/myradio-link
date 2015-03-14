import Mtx from '../libs/math/matrix';

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
    // matrix to be applied on the element.
    this.current = Mtx.create();
  }
}

angular
  .module('app.core')
  .directive('rdMatrix', MatrixApply.factory);

export default MatrixApply;
export {MatrixApplyController};
