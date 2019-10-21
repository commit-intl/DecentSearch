const DecentSearchServer = require('./src/DecentSearchServer');
const config = require('./config.dev.js');

const server = new DecentSearchServer(config);
server.start();
