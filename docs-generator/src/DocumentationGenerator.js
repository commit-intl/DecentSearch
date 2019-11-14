const fs = require('fs');
const path = require('path');
const glob = require('glob');
const TemplateHelper = require('./template.helper');

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

const root = path.resolve(__dirname, '../../definitions');


console.log('searching: ' + root);
const routes = importAll('**/!(*.template).json', { cwd: root + '/routes' });
const types = importAll('**/!(*.template).json', { cwd: root + '/types' });


console.log('reading index.template.md');
const indexTemplate = fs.readFileSync(path.resolve(__dirname, '../../docs/index.template.md'), { encoding: 'utf8' });

console.log('making index.md');
const date = new Date();
const dateString = `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;
const content = {
  version: `WIP ${dateString}`,
  routes: routes.map(route =>
    `[${route.method} ${route.name}](/routes/${TemplateHelper.toFilename(route.name)})`
  ),
  types: types.map(type =>
    `[${type.name}](/types/${TemplateHelper.toFilename(type.name)})`
  ),
};

const indexResult = TemplateHelper.injectContent(indexTemplate, content);

console.log('writing index.md');
fs.writeFileSync(path.resolve(__dirname, '../../docs/index.md'), indexResult, { encoding: 'utf8' });


console.log('reading route.template.md');
const routeTemplate = fs.readFileSync(path.resolve(__dirname, '../../docs/route.template.md'), { encoding: 'utf8' });

console.log('making and writing routes:');
for (let route of routes) {
  console.log(' - '+route.path);
  let request = '';
  if (route.validate) {
    if (route.validate.params) {
      request += '### Parameters\n'+TemplateHelper.createDefinitionTree(route.validate.params);
    }
    if (route.validate.query && route.validate.query.attributes) {
      request += '### Query\n'+TemplateHelper.createDefinitionTree(route.validate.query.attributes);
    }
    if (route.validate.payload) {
      request += '### Payload\n'+TemplateHelper.createDefinitionTree(route.validate.payload);
    }
  }

  let response = '';
  if (route.returns) {
    response += TemplateHelper.createDefinitionTree(route.returns);
  }

  const text = TemplateHelper.injectContent(
    routeTemplate, 
    {
      ...route,
      request,
      response
    });
  fs.writeFileSync(path.resolve(__dirname, `../../docs/routes/${TemplateHelper.toFilename(route.name)}.md`), text, { encoding: 'utf8' });
}

console.log('reading types.template.md');
const typeTemplate = fs.readFileSync(path.resolve(__dirname, '../../docs/type.template.md'), { encoding: 'utf8' });

console.log('making and writing types:');
for (let type of types) {
  console.log(' - '+type.name);

  let definition = '';
  if (type.definition) {
    definition += TemplateHelper.createDefinitionTree(type.definition);
  }

  const text = TemplateHelper.injectContent(
    typeTemplate, 
    {
      ...type,
      definition,
    });
  fs.writeFileSync(path.resolve(__dirname, `../../docs/types/${TemplateHelper.toFilename(type.name)}.md`), text, { encoding: 'utf8' });
}
