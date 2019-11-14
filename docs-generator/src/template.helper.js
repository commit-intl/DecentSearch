function toFilename(name) {
  return encodeURI(name.replace(/ /g, "_").toLowerCase());
}

const createList = array => array.map(entry => `- ${entry}`).join("\n");

const createDefinitionTree = (def, depth = 0) => {
  if (!def || typeof def !== 'object') return '';
  if (Array.isArray(def)) return def.map((def) => createDefinitionTree(def, depth)).join('');

  const { key, type, required } = def;
  let result = "";
  if (key) {
    result += `**${key}** `;
  }
  if (["boolean", "number", "string", "array", "object"].includes(type)) {
    result += `[${type}] `;
  } else {
    result += `[\[${type}\]](./types/${toFilename(type)}) `;
  }
  if (!required) {
    result += `*optional*`;
  }
  result += "\n";

  if (type === "object") {
    result += createDefinitionTree(def.attributes || [], depth+1);
  } else if (type === "array") {
    result += createDefinitionTree(def.items || [], depth+1);
  }

  return " ".repeat(depth * 2) + " - " + result + "\n";
};

const injectContent = (template, content) =>
  template.replace(/\{\{([^\}]*)\}\}/g, (match, id) => {
    if (content[id] != null) {
      if (typeof content[id] === "object") {
        if (Array.isArray(content[id])) {
          return createList(content[id]);
        }
      }
      return content[id];
    }
    return match;
  });

const TemplateHelper = {
  toFilename,
  createList,
  createDefinitionTree,
  injectContent
};

module.exports = TemplateHelper;
