
class AbstractDatabaseAdapter {
  constructor() { }

  __notImplemented(functionName) {
    throw Error('Current DatabaseAdapter does not implement: ' + functionName);
  }

  insertContact() {
    this.__notImplemented('insertContact')
  }
  findContact() {
    this.__notImplemented('findContact')
  }
  updateContact() {
    this.__notImplemented('updateContact')
  }
  removeContact() {
    this.__notImplemented('removeContact')
  }

  insertInternal() {
    this.__notImplemented('insertInternal')
  }
  findInternal() {
    this.__notImplemented('findInternal')
  }
  updateInternal() {
    this.__notImplemented('updateInternal')
  }
  removeInternal() {
    this.__notImplemented('removeInternal')
  }

  insertExternal() {
    this.__notImplemented('insertExternal')
  }
  findExternal() {
    this.__notImplemented('findExternal')
  }
  updateExternal() {
    this.__notImplemented('updateExternal')
  }
  removeExternal() {
    this.__notImplemented('removeExternal')
  }
}


module.exports = AbstractDatabaseAdapter;
