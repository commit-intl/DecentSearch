

module.exports = (server) => [
  {
    path: '/contact-list',
    method: 'GET',
    handler: async (request, h) => {
      const result = await server.db.findContact({}, { perPage: request.query.pp, page: request.query.p });
      return {
        ok: true,
        p: request.query.p,
        pp: request.query.pp,
        result: result.result || [],
      };
    }
  },
];
