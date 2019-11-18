const { randomHashRange } = require('../_helper/test.helper');
const LowDatabaseAdapter = require('../../src/database/LowDatabaseAdapter');

module.exports = (index) => ({
  server: {
    port: 3030+index,
    host: "localhost",
    key: "./cert-privkey.pem",
    cert: "./cert.pem"
  },
  db: {
    adapter: LowDatabaseAdapter,
    options: [
      `./db${index}.json`
    ]
  },
  DecentSearch: {
    identity: {
      private: "",
      public: ""
    },
    hashRange: {
      url: randomHashRange(),
      data: randomHashRange(),
    }
  }
});
