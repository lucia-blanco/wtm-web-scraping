const request = require('request-promise')

const executeScraper = async () => {
  const body = await request.get('https://en.wikipedia.org/wiki/Web_scraping')

  // WE USE REGEX TO FETCH THE TITLE OF THE ARTICLE 🔎
  const pattern = /"firstHeadng" .*>(.*?)</gi
  const result = pattern.exec(body)
  // IF THERE IS NO TITLE, RETURN TITLE NOT FOUND
  const title = result && result[1] ? result[1] : 'Title not found'
  console.log(title)
}

executeScraper()
