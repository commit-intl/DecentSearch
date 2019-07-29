const fs = require('fs');
const path = require('path');
const CryptoHelper = require('./helper/crypto.helper');

class SimpleJsonDatabase {
  constructor(file) {
    this.file = file;
    this.internal = {};
    this.internalUrls = {};
    this.internalUrlsNextId = 0;
    this.internalChanged = Date.now();
    this.external = {};
    this.externalUrls = {};
    this.externalUrlsNextId = 0;
    this.registry = [];

    this.hashCache = {};
  }

  load() {
    this.internal = {};
    if (fs.existsSync(this.file)) {
      const db = JSON.parse(fs.readFileSync(this.file, { encoding: 'utf-8' })) || {};
      this.internal = db.internal;
      this.internalUrls = db.internalUrls;
      this.internalUrlsNextId = db.internalUrlsNextId;
      this.internalChanged = Date.now();
      this.external = db.external;
      this.externalUrls = db.externalUrls;
      this.externalUrlsNextId = db.externalUrlsNextId;
      this.registry = db.registry;
    }
  }

  save() {
    const db = {
      internal: this.internal,
      internalUrls: this.internalUrls,
      internalUrlsNextId: this.internalUrlsNextId,
      internalChanged: this.internalChanged,
      external: this.external,
      externalUrls: this.externalUrls,
      externalUrlsNextId: this.externalUrlsNextId,
      registry: this.registry,
    };
    fs.writeFileSync(
      this.file,
      JSON.stringify(db, null, 2),
      { encoding: 'utf-8' }
    );
  }

  insertRegistryEntry(entry) {
    if (this.registry.find(reg => reg.addr === entry.addr)) {
      return false;
    }

    this.registry.push(entry);
    return true;
  }

  findRegistryEntry(filter) {
    return this.registry.filter(entry => {
      for (let key in filter) {
        if (entry[key] !== filter[key]) return false;
      }
      return true;
    });
  }

  updateRegistryEntry(updatedElement) {
    this.registry = this.registry.map(entry => {
      if (entry.id === updatedElement.id) {
        return updatedElement;
      }
      return entry;
    });
  }

  findRegistryNearest(count) {
    const sortedRegistry = this.registry.sort((a, b) => a.distance - b.distance);
    return sortedRegistry.slice(0, count);
  }

  getRegistry() {
    return this.registry;
  }

  getInternalUrlId(url) {
    for (const key in this.internalUrls) {
      if (this.internalUrls[key] === url) {
        return key;
      }
    }
  }

  getExternalUrlId(url) {
    for (const key in this.externalUrls) {
      if (this.externalUrls[key] === url) {
        return key;
      }
    }
  }

  insertInternalEntries(entries) {
    for (let entry of entries) {
      let urlId = this.getInternalUrlId(entry.location);
      if (urlId == null) {
        urlId = this.internalUrlsNextId++;
        this.internalUrls[urlId] = entry.location;
      }
      if (!this.internal[entry.word]) this.internal[entry.word] = {};
      this.internal[entry.word][urlId] = entry.count;
    }
    this.internalChanged = Date.now();
  }

  deleteInternalLocation(location) {
    let urlId = this.getInternalUrlId(location);
    if (urlId != null) {
      for (let key in this.internal) {
        if (this.internal[key] && this.internal[key][urlId]) {
          delete this.internal[key][urlId];
        }
      }
      delete this.internalUrls[urlId];
    }
    this.internalChanged = Date.now();
  }


  insertExternalEntries(entries) {
    for (let entry of entries) {
      let urlId = this.getExternalUrlId(entry.location);
      if (urlId == null) {
        urlId = this.externalUrlsNextId++;
        this.externalUrls[urlId] = entry.location;
      }
      if (!this.external[entry.word]) this.external[entry.word] = {};
      this.external[entry.word][urlId] = entry.count;
    }
  }

  deleteExternalLocation(location) {
    let urlId = this.getExternalUrlId(location);
    if (urlId != null) {
      for (let key in this.external) {
        if (this.external[key] && this.external[key][urlId]) {
          delete this.external[key][urlId];
        }
      }
      delete this.externalUrls[urlId];
    }
  }

  async findWord(word) {
    let internalResult;
    let externalResult;


    if (this.internal[word]) {
      internalResult = Object.keys(this.internal[word]).map(
        urlId => ({
          url: this.internalUrls[urlId],
          count: this.internal[word][urlId]
        }),
      );
    }

    if (this.external[word]) {
      externalResult = Object.keys(this.external[word]).map(
        urlId => ({
          url: this.externalUrls[urlId],
          count: this.external[word][urlId]
        }),
      );
    }

    return {
      internal: internalResult,
      external: externalResult,
    };
  }

  getInternalRange(start, urlEnd, wordEnd) {
    const result = {};

    for (let word of Object.keys(this.internal)) {
      let wordHash = this.hashCache[word];
      if (!wordHash) {
        this.hashCache[word] = wordHash = CryptoHelper.hash(word);
      }
      let isBetween = false;

      if (start < wordEnd) {
        isBetween = wordHash >= start && wordHash < wordEnd;
      }
      else {
        isBetween = (wordHash <= start) ^ (wordHash > wordEnd);
      }

      if (isBetween) {
        result[word] = Object.keys(this.internal[word]).reduce(
          (acc, urlId) => {
            const url = this.internalUrls[urlId];
            let urlHash = this.hashCache[url];
            if (!urlHash) {
              this.hashCache[url] = urlHash = CryptoHelper.hash(url);
            }
            let isBetween = false;
            if (start < urlEnd) {
              isBetween = urlHash >= start && urlHash < urlEnd;
            }
            else {
              isBetween = (urlHash <= start) ^ (urlHash > urlEnd);
            }
      
            if (isBetween) {
              acc[url] = this.internal[word][urlId];
            }
            return acc;
          },
          {}
        );
      }
    }

    return result;
  }
};

module.exports = SimpleJsonDatabase;
