module.exports = (server) => ({
  path: '/status',
  method: 'GET',
  handler: async (request, h) => {
    return {
      address: server.address,
      version: server.DecentSearchVersion,
      publicKey: server.identity.public,
      range: server.hashRange,
    };
  }
});
