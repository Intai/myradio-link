import dispatcher from '../services/dispatcher.service';
import config from '../services/config.service';
import groups from '../services/group.service';

class Group {

  constructor() {
    this.restrict = 'A';
    this.controller = GroupController;
    this.controllerAs = 'group';
    this.bindToController = true;
  }

  static factory() {
    return new Group();
  }
}

class GroupController {

  constructor($attrs) {
    // key to uniquely identify a group.
    this.key = $attrs.groupKey;
    // unique id of the member in the group.
    this.memberId = $attrs.groupMemberId;
    // stream out group messages for the group key.
    this.messageStream = groups.messageStream
      .filter(_.matcher({groupKey: this.key}))
      .negate(_.matcher({memberId: this.memberId}));
  }

  broadcast(message) {
    // dispatch to broadcast a message.
    dispatcher.dispatch({
      actionType: config.actions.GROUP_BROADCAST,
      memberId: this.memberId,
      groupKey: this.key,
      message: message
    });
  }
}

GroupController.$inject = ['$attrs'];

angular
  .module('app.core')
  .directive('rdGroup', Group.factory);

export default Group;
export {GroupController};
