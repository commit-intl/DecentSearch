const AbstractDatabaseAdapter = require('./AbstractDatabaseAdapter');
const lowDB = require('lowdb');
const FileSync = require('lowdb/adapters/FileSync')

class LowDatabaseAdapter extends AbstractDatabaseAdapter {
  constructor(filePath) {
    this.filePath = filePath;
    this.fileAdapter = new FileSync(filePath);
    this.db = lowDB(this.fileAdapter);
    this.db.defaults({internal: [], external: [], contacts: [] });
    this.db.write();
  }
}

module.exports = LowDatabaseAdapter;

