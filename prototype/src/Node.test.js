
const chalk = require('chalk');
const path = require('path');
const DummyCommunicator = require('./DummyCommunicator');
const Node = require('./Node');
const SimpleJsonDatabase = require('./SimpleJsonDatabase');
const { arrayToHex, arrayCompare } = require('./helper/array.helper');


const NODE_COUNT = 16;
const nodes = [];

for (let i = 0; i < NODE_COUNT; i++) {
  nodes[i] = new Node(
    new DummyCommunicator('node_' + i),
    new SimpleJsonDatabase(path.join(__dirname, `../db/test_${i}.json`)),
    {
      maxConnections: NODE_COUNT / 4,
    }
  );

  if (i > 0) {
    nodes[i].register('node_' + (i - 1), true);
  }
}
nodes.sort((a, b) => arrayCompare(a.id,b.id))

setInterval(() => {
  for (let i = 0; i < NODE_COUNT; i++) {
    let id = arrayToHex(nodes[i].id, 6);
    id = chalk.hex(id)(id);
    let nearest = nodes[i].nearestNodes.map(r => r.id.slice(0,6));
    nearest = nearest.map(id => chalk.hex(id)(id));
    console.log(`${id} [${nearest.join(', ')}]`);
  }
}, 6000);


process.exit(0);
