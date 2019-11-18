module.exports = server => [
  {
    path: "/contact",
    method: "GET",
    handler: async (request, h) => {
      return {
        url: server.address,
        version: server.DecentSearchVersion,
        identity: server.identity.public,
        hashRangeUrl: server.hashRange.url,
        hashRangeData: server.hashRange.data
      };
    }
  },
  {
    path: "/contact",
    method: "POST",
    handler: async (request, h) => {
      const result = await server.db.insertContact(request.payload);
      return {
        ok: result
      };
    }
  }
];
