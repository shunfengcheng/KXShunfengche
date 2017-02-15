const SERVER = require('../utils/leancloud-storage');

class Team extends SERVER.Object {
  get teamsts() {
    return this.get('teamsts');
  }
  set teamsts(value) {
    this.set('teamsts', value);
  }
}
SERVER.Object.register(Team, 'Team');
module.exports = Team;