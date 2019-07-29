
class Indexer {
  constructor(database) {
    this.database = database;
  }

  async indexText(text, location, escape = true) {
    const WORD_REGEX = /\w+/g;
    const escapedText = escape
      ? text.replace(/<[^\>]*?>|<script.*<\/script>/g, (a) => ' '.repeat(a.length))
      : text;
    let match;
    let wordCount = {};
    let words = [];
    while ((match = WORD_REGEX.exec(escapedText)) != null) {
      const word = match[0].toLowerCase();
      if (wordCount[word] === undefined) {
        words.push(word);
      }
      wordCount[word] = (wordCount[word] || 0) + 1;
    }

    let entries = words.map(word => ({ location, word, count: wordCount[word] }));
    await this.database.deleteInternalLocation(location);
    await this.database.insertInternalEntries(entries);
  }

  indexPullResult(pullResult) {
    if (pullResult && typeof pullResult === 'object') {
      const entries = Object.keys(pullResult).reduce(
        (acc, word) => {
          acc.push(
            ...Object.keys(pullResult[word]).map(
              location => ({
                word,
                location,
                count: pullResult[word][location],
              })
            ));
          return acc;
        },
        [],
      );
      this.database.insertExternalEntries(entries);
    }
  }

  async search(query) {
    const words = query.toLowerCase().split(' ');
    const promises = words.map(word => this.database.findWord(word));
    const dbResults = await Promise.all(promises);

    const resultsPerUrl = {};

    const addToResult = word => object => {
      if (word && object) {
        if (!resultsPerUrl[object.url]) resultsPerUrl[object.url] = {};
        resultsPerUrl[object.url][word] = object.count;
      }
    }

    for (let i = 0; i < dbResults.length; i++) {
      const word = words[i];
      const entry = dbResults[i];


      if (entry && entry.internal) {
        entry.internal.forEach(addToResult(word));
      }
      if (entry && entry.external) {
        entry.external.forEach(addToResult(word));
      }
    }

    return resultsPerUrl;
  }
}


module.exports = Indexer;
