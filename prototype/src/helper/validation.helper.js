const fs = require('fs');
const path = require('path');
const glob = require('glob');
const chalk = require('chalk');
const Joi = require('@hapi/joi');

function importAll(pattern, options) {
  const files = glob.sync(pattern, options);
  const results = [];
  for (let file of files) {
    const fullPath = path.join(options.cwd, file);
    let content = fs.readFileSync(fullPath, { encoding: 'utf8' });
    if (file.endsWith('.json')) {
      content = JSON.parse(content);
    }
    results.push(content);
  }
  return results;
}

const root = path.resolve(__dirname, '../../../definitions');

const rawRoutes = importAll('**/!(*.template).json', { cwd: root + '/routes' });
const rawTypes = importAll('**/!(*.template).json', { cwd: root + '/types' });
const routes = {};
const types = {};

const createValidator = (definition) => {
  if (!definition || typeof definition !== 'object') {
    throw new Error('Encountered definition of unknown type!');
  }

  let schema;

  const rule = (defAttr, schemaFunc, optionsTransform = null) => {
    if (schema && definition[defAttr] != null) {
      let options = definition[defAttr];
      if (typeof optionsTransform === 'function') {
        options = optionsTransform(options);
      }
      schema = schema[schemaFunc](options);
    }
  }

  switch (definition.type) {
    case 'boolean':
      schema = Joi.boolean();
      break;
    case 'number':
      schema = Joi.number();
      rule('min', 'min');
      rule('max', 'max');
      rule('precision', 'precision');
      rule('integer', 'integer');
      break;
    case 'string':
      schema = Joi.string();
      rule('min', 'min');
      rule('max', 'max');
      rule('email', 'email');
      rule('base64', 'base64');
      rule('ip', 'ip');
      rule('email', 'email');
      rule('pattern', 'pattern', regexString => {
        const match = regexString.match(/^\/(.*)\/(\w*)$/);
        if (match) {
          return new RegExp(match[1], match[2]);
        }
        else {
          throw new Error('Pattern not a valid regex! ' + regexString);
        }
      });
      break;
    case 'object':
      schema = Joi.object(
        (definition.attributes || []).reduce((acc, attr) => {
          acc[attr.key] = createValidator(attr);
          return acc;
        }, {})
      );
      break;
    case 'array':
      schema = Joi.array();
      schema = schema.items(...(definition.items || []).map(createValidator));
      rule('min', 'min');
      rule('max', 'max');
      break;
    default:
      if (types)
        schema = Joi.any();
      console.warn(chalk.yellow('Unhandled type ' + definition.type));
  }

  rule('required', 'required');

  return schema;
}

rawTypes.reduce((acc, typeDef) => {
  if (!typeDef || typeof typeDef !== 'object') {
    throw new Error('Encountered type definition of unknown type!');
  }

  if (acc[typeDef.name]) {
    throw new Error(`Duplicated type definition for type ${typeDef.name}!`);
  }

  acc[typeDef.name] = createValidator({ ...typeDef.definition, required: true })

  return acc;
}, types);

rawRoutes.reduce((acc, routeDef) => {
  if (!routeDef || typeof routeDef !== 'object') {
    throw new Error('Encountered route definition of unknown type!');
  }

  if (!acc[routeDef.path]) {
    acc[routeDef.path] = {};
  } else if (acc[routeDef.path][routeDef.method]) {
    throw new Error(`Duplicated route definition for path '${routeDef.path}' and method '${routeDef.method}'!`);
  }

  acc[routeDef.path][routeDef.method] = {
    ...routeDef,
    validate: routeDef.validate && {
      params: routeDef.validate.params && createValidator(routeDef.validate.params),
      query: routeDef.validate.query && createValidator(routeDef.validate.query),
      payload: routeDef.validate.payload && createValidator(routeDef.validate.payload),
    },
  };

  return acc;
}, routes);

console.log('Validatable Types: ' + Object.keys(types));
console.log('Validatable Routes: ' + Object.keys(routes));

const getRouteValidation = (path, method) => {
  return routes && routes[path] && routes[path][method];
}

module.exports = {
  getRouteValidation,
  routes,
  types,
};
