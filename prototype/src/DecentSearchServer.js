const hapi = require('@hapi/hapi');
const fs = require('fs');
const http2 = require('http2');
const chalk = require('chalk');
const CryptoHelper = require('./helper/crypto.helper');

class DecentSearchServer {
  constructor(config) {
    this.config = config;
    this.server = null;

    if (
      config.DecentSearch
      && config.DecentSearch.identity
      && config.DecentSearch.identity.private
      && config.DecentSearch.identity.public
    ) {
      this.identity = config.DecentSearch.identity;
    }
    else {
      console.log(chalk.red`WARNING: No DecentSearch.identity defined, generating new one!`);
      CryptoHelper.generateRsaPair()
        .then((keys) => {
          this.identity = keys
        })
        .catch((error) => {
          console.error(error);
          process.exit(1);
        });
    }
  }

  async start() {
    const serverOptions = {
      key: fs.readFileSync(this.config.server.key),
      cert: fs.readFileSync(this.config.server.cert),
    };

    console.log(chalk.green`starting http2 server`);
    const http2Server = http2.createSecureServer(serverOptions);
    this.server = new hapi.Server({
      listener: http2Server,
      port: this.config.server.port,
      host: this.config.server.host,
    });

    // define routes
    this.server.route([
      require('./routes/indentity.route')(this),
    ]);

    // start server
    await this.server.start();
    console.log(chalk.green(`running on ${this.server.info.uri}`));

    return this;
  }
}

module.exports = DecentSearchServer;
