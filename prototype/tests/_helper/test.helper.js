const path = require('path');
const express = require('express');

const randomHashRange = () => {
  const start = Math.floor(Math.random() * 16).toString(16);
  const end = Math.floor(Math.random() * 16).toString(16);
  return start+'-'+end;
}

const startObservation = (servers) => {
  const app = express();

  app.use(express.static(path.join(__dirname, './pages')));

  app.get('/api/servers', (req, res) => {
    res.json(servers.map(server => server.address));
  });
  
  app.listen(8000, function () {
    console.log('Observation server listening on http://localhost:8000/observation.html');
  });
}

module.exports = {
  randomHashRange,
  startObservation,
};
