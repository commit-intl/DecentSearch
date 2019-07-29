const Indexer = require('./Indexer');
const CryptoHelper = require('./helper/crypto.helper');
const { hexToArray } = require('./helper/array.helper');

const SEARCH_MAX_TTL = 8;
const DEFAULT_MAX_CONNECTIONS = 10;
const DEFAULT_HASH_RANGE_WORD = 'ffffffffffffffff';
const DEFAULT_HASH_RANGE_URL = 'ffffffffffffffff';

class Node {
  constructor(communicator, database, options) {
    this.id = CryptoHelper.hash(communicator.host);
    this.communicator = communicator;
    this.database = database;
    this.indexer = new Indexer(database);

    this.options = {
      admins: options.admins || [],
      maxConnections: options.maxConnections || DEFAULT_MAX_CONNECTIONS,
      hashRangeUrl: options.hashRangeUrl || DEFAULT_HASH_RANGE_URL,
      hashRangeWord: options.hashRangeWord || DEFAULT_HASH_RANGE_WORD,
    };

    this.actions = {
      id: () => this.id,
      info: this.info.bind(this),
      pull: this.pull.bind(this),
      search: this.search.bind(this),
      register: this.register.bind(this),
      getRegistryAddresses: () => this.database.getRegistry().map(reg => reg.addr),
    }

    Object.entries(this.actions)
      .forEach(
        ([key, func]) => this.communicator.on(key, func)
      );

    this.taskQueue = [];

    this.taskQueueInterval = setInterval(() => {
      const currentTime = Date.now();

      const result = this.taskQueue.map(task => {
        switch (typeof task) {
          case 'function':
            task();
            return false;
          case 'object':
            if (task.next < currentTime) {
              task.func();
              if (task.interval) {
                task.next += task.interval;
                return true;
              }
              return false;
            }
            break;
        }
        return true;
      });

      this.taskQueue = this.taskQueue.filter((t, index) => result[index]);
    }, 5000);

    this.updateNearestNodes();
    this.taskQueue.push({
      next: Date.now() + 500,
      interval: 5000,
      func: () => this.update(),
    });
  }

  async info() {
    return {
      id: this.id,
      range: this.options.hashRangeUrl,
      host: this.communicator.host,
      admins: this.options.admins,
      nearestNodes: this.nearestNodes,
      database: {
        internalChanged: this.database.internalChanged,
      }
    };
  }

  async update() {
    await this.updateRegistry();
    await this.updateExternalIndex();
  }

  async updateRegistry() {
    const registry = this.database.getRegistry();
    const externalRegistry = (await Promise.all(
      registry.map(
        entry => this.communicator.request(entry.addr, 'getRegistryAddresses')
      )
    )).reduce((acc, registry) => {
      acc.push(...registry.filter(addr => !acc.includes(addr)));
      return acc;
    }, []);

    for (let addr of externalRegistry) {
      await this.register(addr);
    }
  }

  async updateNearestNodes() {
    this.nearestNodes = await this.database.findRegistryNearest(this.options.maxConnections);
  }

  async updateExternalIndex() {
    for (let node of this.database.getRegistry()) {
      const info = await this.communicator.request(node.addr, 'info');
      const dbEntry = (await this.database.findRegistryEntry({ id: node.id }))[0];
      if (dbEntry && info && info.database && info.database.internalChanged > (dbEntry.lastPull || 0)) {
        const answer = await this.communicator.request(
          node.addr,
          'pull',
          {
            start: this.id,
            urlEnd: CryptoHelper.addHashes(this.id, BigInt('0x' + this.options.hashRangeUrl)),
            wordEnd: CryptoHelper.addHashes(this.id, BigInt('0x' + this.options.hashRangeWord)),
          }
        );

        this.indexer.indexPullResult(answer);

        this.database.updateRegistryEntry({ ...dbEntry, lastPull: Date.now() });
      }
    }
  }

  async search(searchQuery) {
    if (!searchQuery || typeof searchQuery.query !== 'string') return null;

    const searchQueryOut = {
      ...searchQuery,
      ttl: Math.min(SEARCH_MAX_TTL, searchQuery.ttl ? searchQuery.ttl - 1 : SEARCH_MAX_TTL),
      searched: searchQuery.searched || []
    };

    const promises = [];

    promises.push(this.indexer.search(searchQuery.query));

    if (searchQueryOut && searchQueryOut.ttl > 0) {
      // TODO: search random nodes
      for (let node of this.nearestNodes) {
        if (!searchQueryOut.searched.includes(node.addr)) {
          searchQueryOut.searched.push(node.addr);
          promises.push(this.communicator.request(node.addr, 'search', searchQueryOut));
        }
      }
    }

    const results = await Promise.all(promises);
    console.log(results);
    return results.reduce(
      (acc, result) => result ? {...result, ...acc} : acc
    , {});
  }

  async pull(request) {
    if (request && request.start && request.urlEnd && request.wordEnd) {
      const range = await this.database.getInternalRange(request.start, request.urlEnd && request.wordEnd);
      return range;
    }
  }

  async register(target, initial = false) {
    // INSERT IF NEW
    if (target && target !== this.communicator.host && this.database.findRegistryEntry({ addr: target }).length === 0) {
      const targetId = await this.communicator.request(target, 'id');
      if (!targetId) {
        console.error('Target does not conform communication standard!', target, targetId);
        return { ok: 0, registered: 0 };
      }
      const hashDistance = CryptoHelper.forwardHashDistance(this.id, targetId);
      this.database.insertRegistryEntry({
        id: targetId,
        addr: target,
        distance: hashDistance,
      });

      if (initial) {
        this.communicator.request(target, 'register', this.communicator.host);
      }

      this.updateNearestNodes();

      return { ok: 1, registered: 1 };
    }
    else {
      return { ok: 1, registered: 0 };
    }
  }
}

module.exports = Node;
