const request = require('request-promise')
const cheerio = require('cheerio')
const moment = require('moment')

const executeScraper = async () => {
  const body = await request.get('https://iwd.gdgmalaga.dev/')
  // LOAD THE HTML TO CHEERIO
  const $ = cheerio.load(body)

  // EXTRACT INFORMATION, USING CSS SELECTORS
  const title = $('h1.wtm-full-screen-title').text().trim().replace(/\n\s*/, ' ')
  const location = $('h1.wtm-full-screen-title ~ h5').text().trim()

  // INFORMATION CAN BE FORMATTED (FOR EXAMPLE, DATES)
  const dateString = $('h1.wtm-full-screen-title ~ h4').text().trim()
  const date = moment(dateString, 'dddd, MMMM Do').format('YYYY-MM-DD')

  // INFORMATION CAN ALSO BE STORED IN TAG ATTRIBUTES
  const tickets = $('.wtm-full-screen-card-container div:last-of-type a:first-of-type').attr('href')

  // EXTRACTING A COLLECTION OF INFORMATION (ARRAY)
  const program = getProgram($, body, date)

  // THIS INFORMATION CAN NOW BE RETURNED ✨
  console.log({ title, date, location, tickets, program })
}

const getProgram = ($, body, date) => {
  // FIRST, SELECT THE PIECES OF HTML THAT WILL TAKE PART
  const talks = $('section[data-section=programa] > div.wtm-container .hoverable', body).toArray()
  const program = []
  // NOW WE ITERATE THROUGH THEM
  talks.forEach(talk => {
    // WE SELECT EACH TAG USING CSS SELECTORS
    const timeString = $(talk).find('.wtm-program-hour').text().trim()
    // WE CAN USED THE DATE EXTRACTED BEFORE TO FORMAT THE TIME TO ISO 🎉
    const time = moment.utc(`${date} ${timeString}`, 'YYYY-MM-DD HH:mm').toISOString()
    // WE USE BOTH TRIM AND REPLACE TO REMOVE LINE JUMPS 🤸‍
    const title = $(talk).find('.wtm-program-title').text().trim().replace(/\n\s*/g, ' ')
    const speaker = $(talk).find('.wtm-program-speaker-name').text().trim()
    const company = $(talk).find('.wtm-program-speaker-name ~ p').text().trim()
    // PUSH OBJECT TO ARRAY
    program.push({ time, speaker, company, title })
  })
  return program
}

executeScraper()