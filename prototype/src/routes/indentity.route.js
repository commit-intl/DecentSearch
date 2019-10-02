module.exports = (server) => ({
  path: '/identity',
  method: 'GET',
  handler: async (request, h) => {
    return {
      public: server.identity.public
    };
  }
});
