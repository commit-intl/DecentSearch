const DecentSearchServer = require('./src/DecentSearchServer');
const config = require('./config.js');

const server = new DecentSearchServer(config);
server.start();
