const AbstractDatabaseAdapter = require('./AbstractDatabaseAdapter');
const lowDB = require('lowdb');
const FileSync = require('lowdb/adapters/FileSync')

class LowDatabaseAdapter extends AbstractDatabaseAdapter {
  constructor(filePath) {
    super();
    this.filePath = filePath;
    this.fileAdapter = new FileSync(filePath);
    this.db = lowDB(this.fileAdapter);
    this.db.defaults({internal: [], external: [], contacts: [] });
    this.db.write();
    this.internal = this.db.get('internal');
    this.external = this.db.get('external');
    this.contacts = this.db.get('contacts');
  }

  findContact(filter, options) {
    let result = !filter || filter === {} ? this.contacts : this.contacts.find(filter);
    if (options) {
      if (options.perPage) {
        const start = options.perPage * (options.page || 0);
        const end = start + options.perPage;
        result = result.slice(start, end);
      }
    }

    return result.value();
  }
}

module.exports = LowDatabaseAdapter;

