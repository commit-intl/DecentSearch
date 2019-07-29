
const int64toHex = (int) => {
  return int && ('0000000000000000' + int.toString(16)).slice(-16);
}

module.exports = {
  int64toHex,
};
