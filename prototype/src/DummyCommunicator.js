const chalk = require('chalk');

class DummyCommunicator {

  constructor(host) {
    this.host = host;
    this.handlers = {};
    DummyCommunicator.network[this.host] = this;
  }
  

  async request(target, action, data) {
    if (!DummyCommunicator.network[target]) {
      console.error('404 target not found!', target);
      return { ok: false, status: 0 };
    }

    return DummyCommunicator.network[target].handleRequest(this.host, action, data);
  }

  handleRequest(source, action, data) {
    if (!this.handlers[action]) {
      console.error('404 action not found!', action);
      return {ok: false, status: 404};
    }

    // console.log(`${chalk.blue(source)} => ${chalk.blue(this.host)} - ${chalk.red(action)}`);

    return this.handlers[action](data);
  }

  on(action, handler) {
    this.handlers[action] = handler;
  }
};

DummyCommunicator.network = {};

module.exports = DummyCommunicator;
