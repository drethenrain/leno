import cloudscraper from 'cloudscraper';
import * as cheerio from 'cheerio';

async function result(product) {
  const result = await cloudscraper.get(
    `https://www.pichau.com.br/search?q=${product}&sort=price-asc`
  );

  const $ = cheerio.load(result);

  const a = $('.MuiGrid-container div').text().split('\n').filter(Boolean);

  console.log(a);
}

result('a320');
