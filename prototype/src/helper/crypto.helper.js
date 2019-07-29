
const hash = require('@sindresorhus/fnv1a').bigInt;

const CryptoHelper = {
  hash(word) {
    return hash(word);
  },

  forwardHashDistance(source, target) {
    const dist = target - source;
    return dist < 0 ? 0xffffffffffffffffn + dist : dist;
  },

  addHashes(alpha, beta) {
    return BigInt.asUintN(64, alpha + beta);
  }
};

module.exports = CryptoHelper;
