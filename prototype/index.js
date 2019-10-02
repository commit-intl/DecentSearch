const DecentSearchServer = require('./src/DecentSearchServer');
const config = require('./config.json');

const server = new DecentSearchServer(config);
server.start();
