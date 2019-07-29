
const ArrayHelper = {
  hexToArray(hex) {
    const result = [];
    for (let i = 0; i < hex.length; i += 2) {
      result.push(Number.parseInt((hex[i] || '0') + (hex[i + 1] || '0'), 16));
    }
    return result;
  },

  arrayToHex(array, cap = undefined) {
    const hexString = array.map(int => ('00' + int.toString(16)).slice(-2)).join('');
    if (cap) {
      return hexString.slice(0, cap);
    }
    return hexString;
  },

  arrayCompare(a, b) {
    for (let i = 0; i < a.length; i++) {
      const comp = Math.sign(a[i] - b[i]);
      if (comp !== 0) {
        return comp;
      }
    }
    return 0;
  },
};

module.exports = ArrayHelper;
