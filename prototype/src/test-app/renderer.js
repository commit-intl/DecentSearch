
const fs = require('fs');
const path = require('path');
const DummyCommunicator = require('../DummyCommunicator');
const Node = require('../Node');
const SimpleJsonDatabase = require('../SimpleJsonDatabase');
const { int64toHex } = require('../helper/bigint.helper');


const NODE_COUNT = 16;
const nodes = [];

const getRandomIp = () => {
  const getRandomByte = () => Math.floor(Math.random() * 256);

  return [
    getRandomByte(),
    getRandomByte(),
    getRandomByte(),
    getRandomByte(),
  ].join('.');
}

for (let i = 0; i < NODE_COUNT; i++) {
  nodes[i] = new Node(
    new DummyCommunicator(getRandomIp()),
    new SimpleJsonDatabase(path.join(__dirname, `../db/test_${i}.json`)),
    {
      maxConnections: NODE_COUNT / 4,
      // 64bit value => all externalIndices with an hash between node.id and (node.id + hashRangeNode) will be cached
      // TODO: maxMemory instead of hashRangeUrl
      hashRangeUrl: 'ffffffffffffffff',
      hashRangeWord: '1000000000000000',
    }
  );

  if (i > 0) {
    nodes[i].register(nodes[i - 1].communicator.host, true);
  }
}

nodes.sort((a, b) => a.id - b.id);


const files = fs.readdirSync(path.join(__dirname, '../../resources/wikipedia'));
files.forEach(file => {
  nodes[0].indexer.indexText(fs.readFileSync(path.join(__dirname, '../../resources/wikipedia', file), { encoding: 'utf-8' }), file);
});


const nodesUI = [];

const create = (string) => document.createElement(string);
const getStylesForHex = (hex) => {
  const val = Number.parseInt(hex, 16) / ((1 << 24) - 1);
  return `padding: 5px; color: hsl(${val * 360}, 100%, 40%)`;
}

const table = create`table`;

for (let i = 0; i < NODE_COUNT; i++) {
  const host = create`tr`;
  const addr = create`td`;
  const id = create`td`;
  const idSpan = create`b`;
  id.appendChild(idSpan);
  const nearest = create`td`;
  const internalFileCount = create`td`;
  const internalWordCount = create`td`;
  const externalFileCount = create`td`;
  const externalWordCount = create`td`;
  host.appendChild(addr);
  host.appendChild(id);
  host.appendChild(nearest);
  host.appendChild(internalFileCount);
  host.appendChild(internalWordCount);
  host.appendChild(externalFileCount);
  host.appendChild(externalWordCount);
  nodesUI.push({
    host,
    addr,
    id,
    nearest,
    internalFileCount,
    internalWordCount,
    externalFileCount,
    externalWordCount,
  });

  host.addEventListener('click', () => setSelectedNode(nodes[i]));

  table.appendChild(host);

  // set fixed values
  addr.textContent = nodes[i].communicator.host;
  const idShortHex = int64toHex(nodes[i].id).slice(0, 6);
  idSpan.textContent = idShortHex;
  idSpan.style = getStylesForHex(idShortHex);
}

document.body.appendChild(table);

setInterval(() => {
  for (let i = 0; i < NODE_COUNT; i++) {
    while (nodesUI[i].nearest.firstChild) {
      nodesUI[i].nearest.removeChild(nodesUI[i].nearest.firstChild);
    }

    nodes[i].nearestNodes.forEach(node => {
      const span = create`b`;
      const idShortHex = int64toHex(node.id).slice(0, 6);
      span.innerText = idShortHex;
      span.style = 'margin-right:5px;' + getStylesForHex(idShortHex);
      nodesUI[i].nearest.appendChild(span);
    });

    nodesUI[i].internalFileCount.textContent = Object.keys(nodes[i].database.internalUrls).length;
    nodesUI[i].internalWordCount.textContent = Object.keys(nodes[i].database.internal).length;
    nodesUI[i].externalFileCount.textContent = Object.keys(nodes[i].database.externalUrls).length;
    nodesUI[i].externalWordCount.textContent = Object.keys(nodes[i].database.external).length;
  }
}, 500);

let selectedNodeUI = create`div`;
let selectedNodeSearch = create`input`;
selectedNodeSearch.type = 'search';
let selectedNodeInfo = create`pre`;
selectedNodeUI.appendChild(selectedNodeSearch);
selectedNodeUI.appendChild(selectedNodeInfo);

document.body.appendChild(selectedNodeUI);


let selectedNode = null;
selectedNodeSearch.addEventListener('keydown', function (event) {
  if (selectedNode && event.key === 'Enter') {
    selectedNode.search({query: event.target.value}).then(result => selectedNodeInfo.textContent = JSON.stringify(result, null, 2));
  }
});

const setSelectedNode = async (node) => {
  selectedNode = node;
  selectedNodeInfo.textContent = JSON.stringify(
    await node.info(),
    (key, value) => {
      if (typeof value === 'bigint') {
        return value.toString(16);
      }
      return value;
    },
    2
  );
};

setTimeout(() => {
  nodes[0].search('born in').then(console.log);
}, 2000);

