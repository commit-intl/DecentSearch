const http = require('https');
const path = require('path');
const fs = require('fs');

function get(url) {
  return new Promise(
    (resolve, reject) => http.get(url, {
      method: 'GET',
    }, function (response) {
      let body = '';
      response.on('data', chunk => body += chunk);
      response.on('end', () => {
        try {
          resolve(JSON.parse(body));
        } catch (error) {
          reject(error);
        }
      });


    })
  );
}

const Wikipedia = {};

Wikipedia.getArticlesByTitle = async (title, lang = 'en') => {
  const response = await get(`https://${lang}.wikipedia.org/w/api.php?action=query&format=json&prop=extracts&titles=${encodeURI(title)}`);

  return response && response.query.pages;
};

Wikipedia.getRandomArticles = async (amount, lang = 'en') => {
  const response = await get(`https://${lang}.wikipedia.org/w/api.php?format=json&action=query&generator=random&grnnamespace=0&prop=extracts&exintro&explaintext&grnlimit=${amount}`)

  return response && response.query.pages;
};


// const titles = ['Wikipedia', 'Germany', 'France', 'United States', 'Japan', 'YouTube', 'StackOverflow', 'Leonardo da Vinci', 'Steve Jobs', 'Bill Gates'];

// const results = [];
// for (let title of titles) {
//   results.push(Wikipedia.getArticlesByTitle(title).then(articles => {
//     if(articles) {
//       for (let articleId in articles) {
//         let article = articles[articleId];
//         fs.writeFileSync(
//           path.join(__dirname, '../resources/wikipedia', article.title + '.txt'),
//           article.extract.replace(/<\/?\w+.*?>/gi, '').replace(/(\s|\n)\1+}/gi, '$1').trim()
//         );
//         return true;
//       }
//     }
//   }))
// }
// 
// Promise.all(results).then(console.log);


const results = [];
results.push(Wikipedia.getRandomArticles(200).then(articles => {
  if (articles) {
    for (let articleId in articles) {
      let article = articles[articleId];
      if(article && article.title && article.extract) {
        console.log(article.title);
        fs.writeFileSync(
          path.join(__dirname, '../resources/wikipedia', article.title + '.txt'),
          article.extract.replace(/<\/?\w+.*?>/gi, '').replace(/(\s|\n)\1+}/gi, '$1').trim()
        );
      }
    }
  }
}));

Promise.all(results).then(console.log);

