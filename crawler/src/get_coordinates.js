import fs from 'fs'

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

async function main() {
  const apiKey = '<api key>'
  const inputFileName = 'jp_stores_13.json'
  const outputFileName = 'jp_stores_13_latlng.json'

  const fileContent = await readFile(inputFileName)
  let stores = JSON.parse(fileContent)
  for (let i=0; i<stores.length; ++i) {
    const address = stores[i].address.join('+').replace(/\s+/g, '+')
    const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${address}&key=${apiKey}`
    const res = await fetch(url)
    const json = await res.json()

    if (json.status === 'OK' && json.results.length > 0) {
      stores[i] = {
        ...stores[i],
        location: json.results[0].geometry.location
      }
    }

    if (i % 10 == 9) {
      console.log(`${i+1} coordinates retrieved`)
    }
  }

  await saveFile(outputFileName, JSON.stringify(stores))
}

main()
