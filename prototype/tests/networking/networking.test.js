
const TestHelper = require('../_helper/test.helper');
const DecentSearchServer = require('../../src/DecentSearchServer');
const config = require('./config.js');


const servers = [];
for (let index = 0; index < 8; index++) {
  const server = new DecentSearchServer(config(index));
  server.start();
  servers.push(server);
}

TestHelper.startObservation(servers);
