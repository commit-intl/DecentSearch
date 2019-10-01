const fs = require('fs');
const path = require('path');
const glob = require('glob');

function toFilename(name) {
  return encodeURI(name.replace(/ /g, '_').toLowerCase());
}

function importAll(pattern, options) {
  const files = glob.sync(pattern, options);
  const results = [];
  console.log('importing: ');
  for (let file of files) {
    const fullPath = path.join(options.cwd, file);
    console.log(' - ' + file);
    let content = fs.readFileSync(fullPath, { encoding: 'utf8' });
    if (file.endsWith('.json')) {
      content = JSON.parse(content);
    }
    results.push(content);
  }
  return results;
}

const root = path.resolve(__dirname, '../definitions');


console.log('searching: ' + root);
const routes = importAll('**/!(*.template).json', { cwd: root + '/routes' });
const types = importAll('**/!(*.template).json', { cwd: root + '/types' });


console.log('reading index.template.md');
const indexTemplate = fs.readFileSync(path.resolve(__dirname, '../docs/index.template.md'), { encoding: 'utf8' });

console.log('making index.md');
const date = new Date();
const dateString = `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;
const content = {
  version: `WIP ${dateString}`,
  routes: routes.map(route =>
    `[${route.method} ${route.route} - ${route.name}](/routes/${toFilename(route.name)}.md)`
  ),
  types: types.map(type =>
    `[${type.name}](/types/${toFilename(type.name)}.md)`
  ),
};

const indexResult = indexTemplate.replace(/\{\{([^\}]*)\}\}/g, (match, id) => {
  if (content[id]) {
    if (typeof content[id] === 'object') {
      if (Array.isArray(content[id])) {
        return content[id].map(entry => `- ${entry}`).join('\n');
      }
    }
    return content[id];
  }
  return match;
});

console.log('writing index.md');
fs.writeFileSync(path.resolve(__dirname, '../docs/index.md'), indexResult, { encoding: 'utf8' });
