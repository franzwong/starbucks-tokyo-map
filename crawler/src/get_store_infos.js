import fs from 'fs'

import cheerio from 'cheerio'
import fetch from 'node-fetch'

async function saveFile(filePath, content) {
  return new Promise((resolve, reject) => {
    fs.writeFile(filePath, content, 'utf8', (err) => {
      if (err) {
        reject(err)
      } else {
        resolve()
      }
    })
  })
}

async function readFile(filePath) {
  return new Promise((resolve, reject) => {
    fs.readFile(filePath, 'utf8', (err, data) => {
      if (err) {
        reject(err)
      } else {
        resolve(data)
      }
    })
  })
}

async function getHtml(url) {
  const res = await fetch(url);
  return res.text();
}

function extractStores($) {
  const entries = []
  $('div#contentsMainIn > table > tbody > tr > td:first-child > a:first-child').each((i, elem) => {
    const $elem = $(elem)
    entries.push({
      name: $elem.html(),
      url: $elem.attr('href')
    })
  })
  return entries
}

function getNextPageUrl($) {
  return $('li.pagenationNext > a').attr('href')
}

function extractStoreDetails($) {
  const details = {}
  $('table.mapTable > tbody > tr').each((i, elem) => {
    const $elem = $(elem)
    const fieldName = $elem.find('th').html()
    if (fieldName.indexOf('Address') >= 0) {
      details.address = $elem.find('td').html()
    } else if (fieldName.indexOf('Business') >= 0) {
      details.businessHour = $elem.find('td').html()
    }
  })
  details.address = processData(details.address)
  details.businessHour = processData(details.businessHour)
  console.log(JSON.stringify(details))
  return details
}

function processData(data) {
  return data
    .replace(/<br>/g, '\n')
    .replace(/\n{2,}/g, '\n')
    .replace(/&#xFF5E;/g, '-')
    .replace(/&#xFF1A;/g, ':')
    .split('\n')
    .map(s => s.trim())
    .filter(s => s.length > 0)
}

async function main() {
  const PREF_CODE_TOKYO = 13
  const prefectureCode = PREF_CODE_TOKYO
  const pageID = 1
  const domain = 'http://www.starbucks.co.jp'
  const outputFileName = `jp_stores_${prefectureCode}_test.json`

  let url = `/en/search/result_store.php?pref_code=${prefectureCode}&pageID=${pageID}`
  let stores = []
  let pageCount = 1
  do {
    const html = await getHtml(domain + url)
    const $ = cheerio.load(html)
    stores = stores.concat(extractStores($))
    console.log(`Page ${pageCount} is loaded`)
    url = getNextPageUrl($)
    pageCount++
  } while (url)

  console.log(`Number of stores: ${stores.length}`)

  for (let i=0; i<stores.length; ++i) {
    const html = await getHtml(domain + stores[i].url)
    const $ = cheerio.load(html)
    const details = extractStoreDetails($)

    stores[i] = {
      ...stores[i],
      ...details
    }
    if (i % 10 == 9) {
      console.log(`${i+1} stores extracted`)
    }
  }

  await saveFile(outputFileName, JSON.stringify(stores))
}

main()
