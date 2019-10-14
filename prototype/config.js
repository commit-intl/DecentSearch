const LowDatabaseAdapter = require('./src/database/LowDatabaseAdapter');

module.exports = {
  server: {
    port: 3030,
    host: "localhost",
    key: "./cert-privkey.pem",
    cert: "./cert.pem"
  },
  db: {
    adapter: LowDatabaseAdapter,
    options: [
      './db/index.json'
    ]
  },
  DecentSearch: {
    identity: {
      private: "",
      public: ""
    }
  }
}
