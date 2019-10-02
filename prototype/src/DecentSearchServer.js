const hapi = require('@hapi/hapi');
const fs = require('fs');
const http2 = require('http2');
const chalk = require('chalk');

class DecentSearchServer {
  constructor(config) {
    this.config = config;
    this.server = null;
  }

  async start() {
    const serverOptions = {
      key: fs.readFileSync(this.config.server.key),
      cert: fs.readFileSync(this.config.server.cert),
      allowHTTP1: true
    };
    
    console.log(chalk.green`starting http2 server`);
    const http2Server = http2.createSecureServer(serverOptions);
    this.server = new hapi.Server({
      listener: http2Server,
      port: this.config.server.port,
      host: this.config.server.host,
    });
    
    // define routes
    this.server.route([{
      method: 'GET',
      path: '/ping',
      handler: (request, h) => {
        return 'pong';
      }
    }]);
    
    // start server
    await this.server.start();
    console.log(chalk.green`running on ${this.server.info.uri}`);

    return this;
  }
}

module.exports = DecentSearchServer;
